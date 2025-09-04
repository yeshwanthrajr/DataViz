import mysql from "mysql2/promise";
import { type User, type InsertUser, type File, type InsertFile, type Chart, type InsertChart, type AdminRequest, type InsertAdminRequest } from "../shared/schema";
import { randomUUID } from "crypto";

export interface IMySqlStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;

  // Files
  createFile(file: InsertFile): Promise<File>;
  getFile(id: string): Promise<File | undefined>;
  getFilesByUser(userId: string): Promise<File[]>;
  getPendingFiles(): Promise<File[]>;
  updateFile(id: string, updates: Partial<File>): Promise<File | undefined>;
  getAllFiles(): Promise<File[]>;

  // Charts
  createChart(chart: InsertChart & { userId: string }): Promise<Chart>;
  getChart(id: string): Promise<Chart | undefined>;
  getChartsByUser(userId: string): Promise<Chart[]>;
  getChartsByFile(fileId: string): Promise<Chart[]>;
  getAllCharts(): Promise<Chart[]>;

  // Admin Requests
  createAdminRequest(request: InsertAdminRequest): Promise<AdminRequest>;
  getAdminRequest(id: string): Promise<AdminRequest | undefined>;
  getPendingAdminRequests(): Promise<AdminRequest[]>;
  updateAdminRequest(id: string, updates: Partial<AdminRequest>): Promise<AdminRequest | undefined>;
}

export class MySqlStorage implements IMySqlStorage {
  private pool: mysql.Pool;

  constructor(connectionConfig?: mysql.PoolOptions) {
    this.pool = mysql.createPool({
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
      database: process.env.DB_NAME || "fileflowpro",
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      ...connectionConfig,
    });

    this.initializeTables();
  }

  private async initializeTables(): Promise<void> {
    try {
      // Create users table
      await this.pool.execute(`
        CREATE TABLE IF NOT EXISTS users (
          id VARCHAR(36) PRIMARY KEY,
          email VARCHAR(255) NOT NULL UNIQUE,
          password VARCHAR(255) NOT NULL,
          role ENUM('user', 'admin', 'superadmin') NOT NULL DEFAULT 'user',
          name VARCHAR(255) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Create files table
      await this.pool.execute(`
        CREATE TABLE IF NOT EXISTS files (
          id VARCHAR(36) PRIMARY KEY,
          user_id VARCHAR(36) NOT NULL,
          filename VARCHAR(255) NOT NULL,
          original_name VARCHAR(255) NOT NULL,
          path TEXT NOT NULL,
          status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
          data JSON,
          uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          approved_by VARCHAR(36),
          approved_at TIMESTAMP NULL,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL
        )
      `);

      // Create charts table
      await this.pool.execute(`
        CREATE TABLE IF NOT EXISTS charts (
          id VARCHAR(36) PRIMARY KEY,
          user_id VARCHAR(36) NOT NULL,
          file_id VARCHAR(36) NOT NULL,
          title VARCHAR(255) NOT NULL,
          type ENUM('bar', 'line', 'pie', '3d') NOT NULL,
          x_axis VARCHAR(255) NOT NULL,
          y_axis VARCHAR(255) NOT NULL,
          config JSON,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY (file_id) REFERENCES files(id) ON DELETE CASCADE
        )
      `);

      // Create admin_requests table
      await this.pool.execute(`
        CREATE TABLE IF NOT EXISTS admin_requests (
          id VARCHAR(36) PRIMARY KEY,
          user_id VARCHAR(36) NOT NULL,
          message TEXT NOT NULL,
          status ENUM('pending', 'approved', 'denied') NOT NULL DEFAULT 'pending',
          requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          reviewed_by VARCHAR(36),
          reviewed_at TIMESTAMP NULL,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL
        )
      `);

      // Insert default users if they don't exist
      await this.initializeDefaultUsers();

    } catch (error) {
      console.error("Error initializing MySQL tables:", error);
    }
  }

  private async initializeDefaultUsers(): Promise<void> {
    try {
      // Check if default users exist
      const [rows] = await this.pool.execute("SELECT COUNT(*) as count FROM users");
      const count = (rows as any)[0].count;

      if (count === 0) {
        // Insert default users
        const defaultUsers = [
          {
            id: randomUUID(),
            email: "superadmin@datavizpro.com",
            password: "$2b$10$1SwkOhQbT0HjRgj2.tsVqOasCc.IMnvO9wCwf1pVZXwvLAVW5r6rG", // password: admin123
            role: "superadmin",
            name: "Super Admin",
          },
          {
            id: randomUUID(),
            email: "admin@datavizpro.com",
            password: "$2b$10$1SwkOhQbT0HjRgj2.tsVqOasCc.IMnvO9wCwf1pVZXwvLAVW5r6rG", // password: admin123
            role: "admin",
            name: "Admin User",
          },
          {
            id: randomUUID(),
            email: "user@datavizpro.com",
            password: "$2b$10$1SwkOhQbT0HjRgj2.tsVqOasCc.IMnvO9wCwf1pVZXwvLAVW5r6rG", // password: admin123
            role: "user",
            name: "John Doe",
          },
        ];

        for (const user of defaultUsers) {
          await this.pool.execute(
            "INSERT INTO users (id, email, password, role, name) VALUES (?, ?, ?, ?, ?)",
            [user.id, user.email, user.password, user.role, user.name]
          );
        }
      }
    } catch (error) {
      console.error("Error initializing default users:", error);
    }
  }

  // Users
  async getUser(id: string): Promise<User | undefined> {
    const [rows] = await this.pool.execute(
      "SELECT id, email, password, role, name, created_at as createdAt FROM users WHERE id = ?",
      [id]
    );
    return (rows as User[])[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [rows] = await this.pool.execute(
      "SELECT id, email, password, role, name, created_at as createdAt FROM users WHERE email = ?",
      [email]
    );
    return (rows as User[])[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = {
      id,
      email: insertUser.email,
      password: insertUser.password,
      name: insertUser.name,
      role: insertUser.role || "user",
      createdAt: new Date(),
    };

    await this.pool.execute(
      "INSERT INTO users (id, email, password, role, name) VALUES (?, ?, ?, ?, ?)",
      [user.id, user.email, user.password, user.role, user.name]
    );

    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const setParts: string[] = [];
    const values: any[] = [];

    Object.entries(updates).forEach(([key, value]) => {
      if (key === "createdAt") return; // Don't update created_at
      setParts.push(`${key} = ?`);
      values.push(value);
    });

    if (setParts.length === 0) return this.getUser(id);

    values.push(id);
    await this.pool.execute(
      `UPDATE users SET ${setParts.join(", ")} WHERE id = ?`,
      values
    );

    return this.getUser(id);
  }

  async getAllUsers(): Promise<User[]> {
    const [rows] = await this.pool.execute(
      "SELECT id, email, password, role, name, created_at as createdAt FROM users ORDER BY created_at DESC"
    );
    return rows as User[];
  }

  // Files
  async createFile(insertFile: InsertFile): Promise<File> {
    const id = randomUUID();
    const file: File = {
      id,
      userId: insertFile.userId,
      filename: insertFile.filename,
      originalName: insertFile.originalName,
      path: insertFile.path,
      status: insertFile.status || "pending",
      data: insertFile.data || [],
      uploadedAt: new Date(),
      approvedBy: null,
      approvedAt: null,
    };

    await this.pool.execute(
      "INSERT INTO files (id, user_id, filename, original_name, path, status, data) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [file.id, file.userId, file.filename, file.originalName, file.path, file.status, JSON.stringify(file.data)]
    );

    return file;
  }

  async getFile(id: string): Promise<File | undefined> {
    const [rows] = await this.pool.execute(
      "SELECT id, user_id as userId, filename, original_name as originalName, path, status, data, uploaded_at as uploadedAt, approved_by as approvedBy, approved_at as approvedAt FROM files WHERE id = ?",
      [id]
    );

    const file = (rows as File[])[0];
    if (file) {
      file.data = JSON.parse(file.data as any || "[]");
    }

    return file;
  }

  async getFilesByUser(userId: string): Promise<File[]> {
    const [rows] = await this.pool.execute(
      "SELECT id, user_id as userId, filename, original_name as originalName, path, status, data, uploaded_at as uploadedAt, approved_by as approvedBy, approved_at as approvedAt FROM files WHERE user_id = ? ORDER BY uploaded_at DESC",
      [userId]
    );

    return (rows as File[]).map(file => ({
      ...file,
      data: JSON.parse(file.data as any || "[]"),
    }));
  }

  async getPendingFiles(): Promise<File[]> {
    const [rows] = await this.pool.execute(
      "SELECT id, user_id as userId, filename, original_name as originalName, path, status, data, uploaded_at as uploadedAt, approved_by as approvedBy, approved_at as approvedAt FROM files WHERE status = 'pending' ORDER BY uploaded_at DESC"
    );

    return (rows as File[]).map(file => ({
      ...file,
      data: JSON.parse(file.data as any || "[]"),
    }));
  }

  async updateFile(id: string, updates: Partial<File>): Promise<File | undefined> {
    const setParts: string[] = [];
    const values: any[] = [];

    Object.entries(updates).forEach(([key, value]) => {
      if (key === "uploadedAt") return; // Don't update uploaded_at
      if (key === "data") {
        setParts.push("data = ?");
        values.push(JSON.stringify(value));
      } else {
        setParts.push(`${key === "userId" ? "user_id" : key === "originalName" ? "original_name" : key === "approvedBy" ? "approved_by" : key === "approvedAt" ? "approved_at" : key} = ?`);
        values.push(value);
      }
    });

    if (setParts.length === 0) return this.getFile(id);

    values.push(id);
    await this.pool.execute(
      `UPDATE files SET ${setParts.join(", ")} WHERE id = ?`,
      values
    );

    return this.getFile(id);
  }

  async getAllFiles(): Promise<File[]> {
    const [rows] = await this.pool.execute(
      "SELECT id, user_id as userId, filename, original_name as originalName, path, status, data, uploaded_at as uploadedAt, approved_by as approvedBy, approved_at as approvedAt FROM files ORDER BY uploaded_at DESC"
    );

    return (rows as File[]).map(file => ({
      ...file,
      data: JSON.parse(file.data as any || "[]"),
    }));
  }

  // Charts
  async createChart(insertChart: InsertChart & { userId: string }): Promise<Chart> {
    const id = randomUUID();
    const chart: Chart = {
      id,
      userId: insertChart.userId,
      fileId: insertChart.fileId,
      title: insertChart.title,
      type: insertChart.type,
      xAxis: insertChart.xAxis,
      yAxis: insertChart.yAxis,
      config: insertChart.config || {},
      createdAt: new Date(),
    };

    await this.pool.execute(
      "INSERT INTO charts (id, user_id, file_id, title, type, x_axis, y_axis, config) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [chart.id, chart.userId, chart.fileId, chart.title, chart.type, chart.xAxis, chart.yAxis, JSON.stringify(chart.config)]
    );

    return chart;
  }

  async getChart(id: string): Promise<Chart | undefined> {
    const [rows] = await this.pool.execute(
      "SELECT id, user_id as userId, file_id as fileId, title, type, x_axis as xAxis, y_axis as yAxis, config, created_at as createdAt FROM charts WHERE id = ?",
      [id]
    );

    const chart = (rows as Chart[])[0];
    if (chart) {
      chart.config = JSON.parse(chart.config as any || "{}");
    }

    return chart;
  }

  async getChartsByUser(userId: string): Promise<Chart[]> {
    const [rows] = await this.pool.execute(
      "SELECT id, user_id as userId, file_id as fileId, title, type, x_axis as xAxis, y_axis as yAxis, config, created_at as createdAt FROM charts WHERE user_id = ? ORDER BY created_at DESC",
      [userId]
    );

    return (rows as Chart[]).map(chart => ({
      ...chart,
      config: JSON.parse(chart.config as any || "{}"),
    }));
  }

  async getChartsByFile(fileId: string): Promise<Chart[]> {
    const [rows] = await this.pool.execute(
      "SELECT id, user_id as userId, file_id as fileId, title, type, x_axis as xAxis, y_axis as yAxis, config, created_at as createdAt FROM charts WHERE file_id = ? ORDER BY created_at DESC",
      [fileId]
    );

    return (rows as Chart[]).map(chart => ({
      ...chart,
      config: JSON.parse(chart.config as any || "{}"),
    }));
  }

  async getAllCharts(): Promise<Chart[]> {
    const [rows] = await this.pool.execute(
      "SELECT id, user_id as userId, file_id as fileId, title, type, x_axis as xAxis, y_axis as yAxis, config, created_at as createdAt FROM charts ORDER BY created_at DESC"
    );

    return (rows as Chart[]).map(chart => ({
      ...chart,
      config: JSON.parse(chart.config as any || "{}"),
    }));
  }

  // Admin Requests
  async createAdminRequest(insertRequest: InsertAdminRequest): Promise<AdminRequest> {
    const id = randomUUID();
    const request: AdminRequest = {
      id,
      userId: insertRequest.userId,
      message: insertRequest.message,
      status: insertRequest.status || "pending",
      requestedAt: new Date(),
      reviewedBy: null,
      reviewedAt: null,
    };

    await this.pool.execute(
      "INSERT INTO admin_requests (id, user_id, message, status) VALUES (?, ?, ?, ?)",
      [request.id, request.userId, request.message, request.status]
    );

    return request;
  }

  async getAdminRequest(id: string): Promise<AdminRequest | undefined> {
    const [rows] = await this.pool.execute(
      "SELECT id, user_id as userId, message, status, requested_at as requestedAt, reviewed_by as reviewedBy, reviewed_at as reviewedAt FROM admin_requests WHERE id = ?",
      [id]
    );
    return (rows as AdminRequest[])[0];
  }

  async getPendingAdminRequests(): Promise<AdminRequest[]> {
    const [rows] = await this.pool.execute(
      "SELECT id, user_id as userId, message, status, requested_at as requestedAt, reviewed_by as reviewedBy, reviewed_at as reviewedAt FROM admin_requests WHERE status = 'pending' ORDER BY requested_at DESC"
    );
    return rows as AdminRequest[];
  }

  async updateAdminRequest(id: string, updates: Partial<AdminRequest>): Promise<AdminRequest | undefined> {
    const setParts: string[] = [];
    const values: any[] = [];

    Object.entries(updates).forEach(([key, value]) => {
      if (key === "requestedAt") return; // Don't update requested_at
      setParts.push(`${key === "userId" ? "user_id" : key === "reviewedBy" ? "reviewed_by" : key === "reviewedAt" ? "reviewed_at" : key} = ?`);
      values.push(value);
    });

    if (setParts.length === 0) return this.getAdminRequest(id);

    values.push(id);
    await this.pool.execute(
      `UPDATE admin_requests SET ${setParts.join(", ")} WHERE id = ?`,
      values
    );

    return this.getAdminRequest(id);
  }

  // Cleanup method
  async close(): Promise<void> {
    await this.pool.end();
  }
}