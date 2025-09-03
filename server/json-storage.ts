import { type User, type InsertUser, type File, type InsertFile, type Chart, type InsertChart, type AdminRequest, type InsertAdminRequest } from "../shared/schema";
import { randomUUID } from "crypto";
import * as fs from "fs";
import * as path from "path";

export interface IJsonStorage {
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

  // Admin Requests
  createAdminRequest(request: InsertAdminRequest): Promise<AdminRequest>;
  getAdminRequest(id: string): Promise<AdminRequest | undefined>;
  getPendingAdminRequests(): Promise<AdminRequest[]>;
  updateAdminRequest(id: string, updates: Partial<AdminRequest>): Promise<AdminRequest | undefined>;
}

interface JsonData {
  users: User[];
  files: File[];
  charts: Chart[];
  adminRequests: AdminRequest[];
}

export class JsonStorage implements IJsonStorage {
  private dataFile: string;
  private data: JsonData;

  constructor(dataFile: string = "./data.json") {
    this.dataFile = path.resolve(dataFile);
    this.data = this.loadData();
  }

  private loadData(): JsonData {
    try {
      if (fs.existsSync(this.dataFile)) {
        const content = fs.readFileSync(this.dataFile, "utf-8");
        return JSON.parse(content);
      }
    } catch (error) {
      console.error("Error loading JSON data:", error);
    }

    // Return default data structure
    return {
      users: [
        {
          id: randomUUID(),
          email: "superadmin@datavizpro.com",
          password: "$2b$10$1SwkOhQbT0HjRgj2.tsVqOasCc.IMnvO9wCwf1pVZXwvLAVW5r6rG", // password: admin123
          role: "superadmin",
          name: "Super Admin",
          createdAt: new Date(),
        },
        {
          id: randomUUID(),
          email: "admin@datavizpro.com",
          password: "$2b$10$1SwkOhQbT0HjRgj2.tsVqOasCc.IMnvO9wCwf1pVZXwvLAVW5r6rG", // password: admin123
          role: "admin",
          name: "Admin User",
          createdAt: new Date(),
        },
        {
          id: randomUUID(),
          email: "user@datavizpro.com",
          password: "$2b$10$1SwkOhQbT0HjRgj2.tsVqOasCc.IMnvO9wCwf1pVZXwvLAVW5r6rG", // password: admin123
          role: "user",
          name: "John Doe",
          createdAt: new Date(),
        },
      ],
      files: [],
      charts: [],
      adminRequests: [],
    };
  }

  private saveData(): void {
    try {
      // Ensure directory exists
      const dir = path.dirname(this.dataFile);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      fs.writeFileSync(this.dataFile, JSON.stringify(this.data, null, 2));
    } catch (error) {
      console.error("Error saving JSON data:", error);
    }
  }

  // Users
  async getUser(id: string): Promise<User | undefined> {
    return this.data.users.find(user => user.id === id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return this.data.users.find(user => user.email === email);
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

    this.data.users.push(user);
    this.saveData();
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const index = this.data.users.findIndex(user => user.id === id);
    if (index === -1) return undefined;

    this.data.users[index] = { ...this.data.users[index], ...updates };
    this.saveData();
    return this.data.users[index];
  }

  async getAllUsers(): Promise<User[]> {
    return [...this.data.users];
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

    this.data.files.push(file);
    this.saveData();
    return file;
  }

  async getFile(id: string): Promise<File | undefined> {
    return this.data.files.find(file => file.id === id);
  }

  async getFilesByUser(userId: string): Promise<File[]> {
    return this.data.files.filter(file => file.userId === userId);
  }

  async getPendingFiles(): Promise<File[]> {
    return this.data.files.filter(file => file.status === "pending");
  }

  async updateFile(id: string, updates: Partial<File>): Promise<File | undefined> {
    const index = this.data.files.findIndex(file => file.id === id);
    if (index === -1) return undefined;

    this.data.files[index] = { ...this.data.files[index], ...updates };
    this.saveData();
    return this.data.files[index];
  }

  async getAllFiles(): Promise<File[]> {
    return [...this.data.files];
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

    this.data.charts.push(chart);
    this.saveData();
    return chart;
  }

  async getChart(id: string): Promise<Chart | undefined> {
    return this.data.charts.find(chart => chart.id === id);
  }

  async getChartsByUser(userId: string): Promise<Chart[]> {
    return this.data.charts.filter(chart => chart.userId === userId);
  }

  async getChartsByFile(fileId: string): Promise<Chart[]> {
    return this.data.charts.filter(chart => chart.fileId === fileId);
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

    this.data.adminRequests.push(request);
    this.saveData();
    return request;
  }

  async getAdminRequest(id: string): Promise<AdminRequest | undefined> {
    return this.data.adminRequests.find(request => request.id === id);
  }

  async getPendingAdminRequests(): Promise<AdminRequest[]> {
    return this.data.adminRequests.filter(request => request.status === "pending");
  }

  async updateAdminRequest(id: string, updates: Partial<AdminRequest>): Promise<AdminRequest | undefined> {
    const index = this.data.adminRequests.findIndex(request => request.id === id);
    if (index === -1) return undefined;

    this.data.adminRequests[index] = { ...this.data.adminRequests[index], ...updates };
    this.saveData();
    return this.data.adminRequests[index];
  }
}