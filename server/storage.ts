import { type User, type InsertUser, type File, type InsertFile, type Chart, type InsertChart, type AdminRequest, type InsertAdminRequest } from "@shared/schema";
import { randomUUID } from "crypto";
import { DbStorage } from "./db-storage";
import { JsonStorage } from "./json-storage";
import { MySqlStorage } from "./mysql-storage";

export interface IStorage {
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

export class MemStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private files: Map<string, File> = new Map();
  private charts: Map<string, Chart> = new Map();
  private adminRequests: Map<string, AdminRequest> = new Map();

  constructor() {
    // Create default super admin
    const superAdminId = randomUUID();
    this.users.set(superAdminId, {
      id: superAdminId,
      email: "superadmin@datavizpro.com",
      password: "$2b$10$1SwkOhQbT0HjRgj2.tsVqOasCc.IMnvO9wCwf1pVZXwvLAVW5r6rG", // password: admin123
      role: "superadmin",
      name: "Super Admin",
      createdAt: new Date(),
    });

    // Create sample admin
    const adminId = randomUUID();
    this.users.set(adminId, {
      id: adminId,
      email: "admin@datavizpro.com",
      password: "$2b$10$1SwkOhQbT0HjRgj2.tsVqOasCc.IMnvO9wCwf1pVZXwvLAVW5r6rG", // password: admin123
      role: "admin",
      name: "Admin User",
      createdAt: new Date(),
    });

    // Create sample user
    const userId = randomUUID();
    this.users.set(userId, {
      id: userId,
      email: "user@datavizpro.com",
      password: "$2b$10$1SwkOhQbT0HjRgj2.tsVqOasCc.IMnvO9wCwf1pVZXwvLAVW5r6rG", // password: admin123
      role: "user",
      name: "John Doe",
      createdAt: new Date(),
    });
  }

  // Users
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = {
      ...insertUser,
      id,
      role: insertUser.role || "user",
      createdAt: new Date()
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  // Files
  async createFile(insertFile: InsertFile): Promise<File> {
    const id = randomUUID();
    const file: File = {
      ...insertFile,
      id,
      data: insertFile.data || [],
      status: insertFile.status || "pending",
      uploadedAt: new Date(),
      approvedBy: null,
      approvedAt: null,
    };
    this.files.set(id, file);
    return file;
  }

  async getFile(id: string): Promise<File | undefined> {
    return this.files.get(id);
  }

  async getFilesByUser(userId: string): Promise<File[]> {
    return Array.from(this.files.values()).filter(file => file.userId === userId);
  }

  async getPendingFiles(): Promise<File[]> {
    return Array.from(this.files.values()).filter(file => file.status === "pending");
  }

  async updateFile(id: string, updates: Partial<File>): Promise<File | undefined> {
    const file = this.files.get(id);
    if (!file) return undefined;
    
    const updatedFile = { ...file, ...updates };
    this.files.set(id, updatedFile);
    return updatedFile;
  }

  async getAllFiles(): Promise<File[]> {
    return Array.from(this.files.values());
  }

  // Charts
  async createChart(insertChart: InsertChart & { userId: string }): Promise<Chart> {
    const id = randomUUID();
    const chart: Chart = {
      ...insertChart,
      id,
      config: insertChart.config || {},
      createdAt: new Date()
    };
    this.charts.set(id, chart);
    return chart;
  }

  async getChart(id: string): Promise<Chart | undefined> {
    return this.charts.get(id);
  }

  async getChartsByUser(userId: string): Promise<Chart[]> {
    return Array.from(this.charts.values()).filter(chart => chart.userId === userId);
  }

  async getChartsByFile(fileId: string): Promise<Chart[]> {
    return Array.from(this.charts.values()).filter(chart => chart.fileId === fileId);
  }

  async getAllCharts(): Promise<Chart[]> {
    return Array.from(this.charts.values());
  }

  // Admin Requests
  async createAdminRequest(insertRequest: InsertAdminRequest): Promise<AdminRequest> {
    const id = randomUUID();
    const request: AdminRequest = {
      ...insertRequest,
      id,
      status: insertRequest.status || "pending",
      requestedAt: new Date(),
      reviewedBy: null,
      reviewedAt: null,
    };
    this.adminRequests.set(id, request);
    return request;
  }

  async getAdminRequest(id: string): Promise<AdminRequest | undefined> {
    return this.adminRequests.get(id);
  }

  async getPendingAdminRequests(): Promise<AdminRequest[]> {
    return Array.from(this.adminRequests.values()).filter(request => request.status === "pending");
  }

  async updateAdminRequest(id: string, updates: Partial<AdminRequest>): Promise<AdminRequest | undefined> {
    const request = this.adminRequests.get(id);
    if (!request) return undefined;
    
    const updatedRequest = { ...request, ...updates };
    this.adminRequests.set(id, updatedRequest);
    return updatedRequest;
  }
}

// Storage selection logic
const storageType = process.env.STORAGE_TYPE || "memory"; // memory, json, mysql, postgres
console.log("🔍 Detected STORAGE_TYPE:", storageType);
console.log("🔍 Available env vars:", Object.keys(process.env).filter(key => key.includes("STORAGE") || key.includes("DATABASE")));

let storage: IStorage;

switch (storageType.toLowerCase()) {
  case "postgres":
  case "postgresql":
    if (process.env.DATABASE_URL) {
      try {
        const dbStorage = new DbStorage();
        storage = dbStorage;
        console.log("✅ Using PostgreSQL database storage");
      } catch (error) {
        console.error("❌ Failed to initialize PostgreSQL storage, falling back to JSON:", error);
        storage = new JsonStorage();
      }
    } else {
      console.log("⚠️  DATABASE_URL not set, falling back to JSON storage");
      storage = new JsonStorage();
    }
    break;

  case "mysql":
    try {
      const mysqlStorage = new MySqlStorage();
      storage = mysqlStorage;
      console.log("✅ Using MySQL database storage");
    } catch (error) {
      console.error("❌ Failed to initialize MySQL storage, falling back to JSON:", error);
      storage = new JsonStorage();
    }
    break;

  case "json":
    try {
      storage = new JsonStorage();
      console.log("✅ Using JSON file storage");
    } catch (error) {
      console.error("❌ Failed to initialize JSON storage, falling back to memory:", error);
      storage = new MemStorage();
    }
    break;

  case "memory":
  default:
    console.log("✅ Using in-memory storage");
    storage = new MemStorage();
    break;
}

export { storage };
