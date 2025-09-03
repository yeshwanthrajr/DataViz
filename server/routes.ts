import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import multer from "multer";
import path from "path";
import fs from "fs";
// XLSX will be imported dynamically
import { insertUserSchema, insertFileSchema, insertChartSchema, insertAdminRequestSchema } from "@shared/schema";
import { z } from "zod";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// Multer configuration for file uploads
const upload = multer({
  dest: "uploads/",
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "text/csv",
      "application/csv"
    ];
    const allowedExtensions = ['.xlsx', '.xls', '.csv'];
    const fileExtension = path.extname(file.originalname).toLowerCase();
    
    if (allowedTypes.includes(file.mimetype) || allowedExtensions.includes(fileExtension)) {
      cb(null, true);
    } else {
      cb(new Error("Only Excel (.xlsx, .xls) and CSV files are allowed"));
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  }
});

// Middleware to verify JWT token
const authenticateToken = async (req: any, res: any, next: any) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Access token required" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    const user = await storage.getUser(decoded.userId);
    
    if (!user) {
      return res.status(401).json({ message: "Invalid token" });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ message: "Invalid or expired token" });
  }
};

// Middleware to check role permissions
const requireRole = (roles: string[]) => {
  return (req: any, res: any, next: any) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Insufficient permissions" });
    }
    next();
  };
};

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Authentication routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      
      // Create user
      const user = await storage.createUser({
        ...userData,
        password: hashedPassword,
      });

      // Generate token
      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "7d" });

      res.json({
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;

      // Find user
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Check password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Generate token
      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "7d" });

      res.json({
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/auth/me", authenticateToken, (req: any, res) => {
    res.json({
      user: {
        id: req.user.id,
        email: req.user.email,
        name: req.user.name,
        role: req.user.role,
      },
    });
  });

  // File upload routes
  app.post("/api/files/upload", authenticateToken, upload.single("file"), async (req: any, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      console.log("Processing file:", req.file.originalname, "at path:", req.file.path);
      
      let data: any[] = [];
      const fileExtension = path.extname(req.file.originalname).toLowerCase();
      
      if (fileExtension === '.csv') {
        // Parse CSV file manually
        const fileContent = fs.readFileSync(req.file.path, 'utf-8');
        const lines = fileContent.trim().split('\n');
        const headers = lines[0].split(',');
        
        data = lines.slice(1).map(line => {
          const values = line.split(',');
          const row: any = {};
          headers.forEach((header, index) => {
            row[header] = values[index] || '';
          });
          return row;
        });
      } else {
        // For Excel files, use dynamic import of XLSX
        try {
          const XLSXModule = await import("xlsx");
          const XLSX = XLSXModule.default || XLSXModule;
          
          const workbook = XLSX.readFile(req.file.path);
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          data = XLSX.utils.sheet_to_json(worksheet);
        } catch (xlsxError) {
          console.error("XLSX processing error:", xlsxError);
          throw new Error("Unable to process Excel file");
        }
      }

      console.log("Parsed", data.length, "rows from file");

      // Create file record
      const file = await storage.createFile({
        userId: req.user.id,
        filename: req.file.filename,
        originalName: req.file.originalname,
        path: req.file.path,
        status: "pending",
        data: data,
      });

      console.log("File record created:", file.id);
      res.json(file);
    } catch (error) {
      console.error("File upload error:", error);
      res.status(500).json({ message: "Error processing file", error: error.message });
    }
  });

  app.get("/api/files", authenticateToken, async (req: any, res) => {
    try {
      let files;

      if (req.user.role === "superadmin") {
        files = await storage.getAllFiles();
      } else if (req.user.role === "admin") {
        files = await storage.getAllFiles();
      } else {
        files = await storage.getFilesByUser(req.user.id);
      }

      res.json(files);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  // IMPORTANT: This route must come BEFORE /api/files/:id to avoid conflicts
  app.get("/api/files/pending", authenticateToken, requireRole(["admin", "superadmin"]), async (req, res) => {
    try {
      const files = await storage.getPendingFiles();
      res.json(files);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/files/:id", authenticateToken, async (req: any, res) => {
    try {
      const { id } = req.params;
      const file = await storage.getFile(id);

      if (!file) {
        return res.status(404).json({ message: "File not found" });
      }

      // Check if user has access to this file
      if (file.userId !== req.user.id && !["admin", "superadmin"].includes(req.user.role)) {
        return res.status(403).json({ message: "Access denied" });
      }

      res.json(file);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.patch("/api/files/:id/approve", authenticateToken, requireRole(["admin", "superadmin"]), async (req: any, res) => {
    try {
      const { id } = req.params;
      const file = await storage.updateFile(id, {
        status: "approved",
        approvedBy: req.user.id,
        approvedAt: new Date(),
      });

      if (!file) {
        return res.status(404).json({ message: "File not found" });
      }

      res.json(file);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.patch("/api/files/:id/reject", authenticateToken, requireRole(["admin", "superadmin"]), async (req: any, res) => {
    try {
      const { id } = req.params;
      const file = await storage.updateFile(id, {
        status: "rejected",
        approvedBy: req.user.id,
        approvedAt: new Date(),
      });

      if (!file) {
        return res.status(404).json({ message: "File not found" });
      }

      res.json(file);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  // Chart routes
  app.post("/api/charts", authenticateToken, async (req: any, res) => {
    try {
      console.log("Chart creation request body:", JSON.stringify(req.body, null, 2));
      console.log("User ID:", req.user.id);
      
      const chartData = insertChartSchema.parse(req.body);
      
      // Verify user owns the file or has admin privileges
      const file = await storage.getFile(chartData.fileId);
      if (!file) {
        return res.status(404).json({ message: "File not found" });
      }

      if (file.userId !== req.user.id && !["admin", "superadmin"].includes(req.user.role)) {
        return res.status(403).json({ message: "Access denied" });
      }

      if (file.status !== "approved") {
        return res.status(400).json({ message: "File must be approved before creating charts" });
      }

      const chart = await storage.createChart({
        ...chartData,
        userId: req.user.id,
      } as any);

      console.log("Chart created successfully:", chart.id);
      res.json(chart);
    } catch (error) {
      console.error("Chart creation error:", error);
      if (error instanceof z.ZodError) {
        console.log("Validation errors:", error.errors);
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Server error", error: error.message });
    }
  });

  app.get("/api/charts", authenticateToken, async (req: any, res) => {
    try {
      const charts = await storage.getChartsByUser(req.user.id);
      res.json(charts);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/charts/file/:fileId", authenticateToken, async (req: any, res) => {
    try {
      const { fileId } = req.params;
      
      // Verify user has access to file
      const file = await storage.getFile(fileId);
      if (!file) {
        return res.status(404).json({ message: "File not found" });
      }

      if (file.userId !== req.user.id && !["admin", "superadmin"].includes(req.user.role)) {
        return res.status(403).json({ message: "Access denied" });
      }

      const charts = await storage.getChartsByFile(fileId);
      res.json(charts);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  // Admin request routes
  app.post("/api/admin-requests", authenticateToken, async (req: any, res) => {
    try {
      if (req.user.role !== "user") {
        return res.status(400).json({ message: "Only regular users can request admin access" });
      }

      const requestData = insertAdminRequestSchema.parse(req.body);
      
      const request = await storage.createAdminRequest({
        ...requestData,
        userId: req.user.id,
      });

      res.json(request);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/admin-requests/pending", authenticateToken, requireRole(["superadmin"]), async (req, res) => {
    try {
      const requests = await storage.getPendingAdminRequests();
      res.json(requests);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.patch("/api/admin-requests/:id/approve", authenticateToken, requireRole(["superadmin"]), async (req: any, res) => {
    try {
      const { id } = req.params;
      
      const request = await storage.getAdminRequest(id);
      if (!request) {
        return res.status(404).json({ message: "Request not found" });
      }

      // Update request status
      await storage.updateAdminRequest(id, {
        status: "approved",
        reviewedBy: req.user.id,
        reviewedAt: new Date(),
      });

      // Promote user to admin
      await storage.updateUser(request.userId, { role: "admin" });

      res.json({ message: "User promoted to admin successfully" });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.patch("/api/admin-requests/:id/deny", authenticateToken, requireRole(["superadmin"]), async (req: any, res) => {
    try {
      const { id } = req.params;
      
      const request = await storage.updateAdminRequest(id, {
        status: "denied",
        reviewedBy: req.user.id,
        reviewedAt: new Date(),
      });

      if (!request) {
        return res.status(404).json({ message: "Request not found" });
      }

      res.json(request);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  // User management routes (Super Admin only)
  app.get("/api/users", authenticateToken, requireRole(["superadmin", "admin"]), async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      const safeUsers = users.map(user => ({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        createdAt: user.createdAt,
      }));
      res.json(safeUsers);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.patch("/api/users/:id/role", authenticateToken, requireRole(["superadmin"]), async (req: any, res) => {
    try {
      const { id } = req.params;
      const { role } = req.body;

      if (!["user", "admin"].includes(role)) {
        return res.status(400).json({ message: "Invalid role" });
      }

      const user = await storage.updateUser(id, { role });
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({ message: "User role updated successfully" });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  // Stats routes
  app.get("/api/stats/dashboard", authenticateToken, async (req: any, res) => {
    try {
      const files = await storage.getFilesByUser(req.user.id);
      const charts = await storage.getChartsByUser(req.user.id);
      
      const stats = {
        totalUploads: files.length,
        approved: files.filter(f => f.status === "approved").length,
        pending: files.filter(f => f.status === "pending").length,
        charts: charts.length,
      };

      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/stats/admin", authenticateToken, requireRole(["admin", "superadmin"]), async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      const files = await storage.getAllFiles();
      const pendingFiles = await storage.getPendingFiles();

      const stats = {
        activeUsers: users.filter(u => u.role === "user").length,
        monthlyFiles: files.filter(f => {
          const oneMonthAgo = new Date();
          oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
          return f.uploadedAt && f.uploadedAt > oneMonthAgo;
        }).length,
        chartsGenerated: 0, // Would need to calculate from all users
        storageUsed: "2.4GB", // Mock value
        pendingApprovals: pendingFiles.length,
      };

      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/stats/superadmin", authenticateToken, requireRole(["superadmin"]), async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      const files = await storage.getAllFiles();
      const pendingRequests = await storage.getPendingAdminRequests();
      
      const stats = {
        totalUsers: users.length,
        pendingApprovals: files.filter(f => f.status === "pending").length,
        filesProcessed: files.filter(f => f.status !== "pending").length,
        adminRequests: pendingRequests.length,
      };

      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
