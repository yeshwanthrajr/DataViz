import { eq, and } from "drizzle-orm";
import { db } from "./db";
import { users, files, charts, adminRequests } from "../shared/schema";
import type { User, InsertUser, File, InsertFile, Chart, InsertChart, AdminRequest, InsertAdminRequest } from "../shared/schema";
import { randomUUID } from "crypto";

export interface IDbStorage {
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

export class DbStorage implements IDbStorage {
  // Users
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0];
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

    await db.insert(users).values(user);
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    await db.update(users).set(updates).where(eq(users.id, id));
    return this.getUser(id);
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
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

    await db.insert(files).values(file);
    return file;
  }

  async getFile(id: string): Promise<File | undefined> {
    const result = await db.select().from(files).where(eq(files.id, id)).limit(1);
    return result[0];
  }

  async getFilesByUser(userId: string): Promise<File[]> {
    return await db.select().from(files).where(eq(files.userId, userId));
  }

  async getPendingFiles(): Promise<File[]> {
    return await db.select().from(files).where(eq(files.status, "pending"));
  }

  async updateFile(id: string, updates: Partial<File>): Promise<File | undefined> {
    await db.update(files).set(updates).where(eq(files.id, id));
    return this.getFile(id);
  }

  async getAllFiles(): Promise<File[]> {
    return await db.select().from(files);
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

    await db.insert(charts).values(chart);
    return chart;
  }

  async getChart(id: string): Promise<Chart | undefined> {
    const result = await db.select().from(charts).where(eq(charts.id, id)).limit(1);
    return result[0];
  }

  async getChartsByUser(userId: string): Promise<Chart[]> {
    return await db.select().from(charts).where(eq(charts.userId, userId));
  }

  async getChartsByFile(fileId: string): Promise<Chart[]> {
    return await db.select().from(charts).where(eq(charts.fileId, fileId));
  }

  async getAllCharts(): Promise<Chart[]> {
    return await db.select().from(charts);
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

    await db.insert(adminRequests).values(request);
    return request;
  }

  async getAdminRequest(id: string): Promise<AdminRequest | undefined> {
    const result = await db.select().from(adminRequests).where(eq(adminRequests.id, id)).limit(1);
    return result[0];
  }

  async getPendingAdminRequests(): Promise<AdminRequest[]> {
    return await db.select().from(adminRequests).where(eq(adminRequests.status, "pending"));
  }

  async updateAdminRequest(id: string, updates: Partial<AdminRequest>): Promise<AdminRequest | undefined> {
    await db.update(adminRequests).set(updates).where(eq(adminRequests.id, id));
    return this.getAdminRequest(id);
  }
}