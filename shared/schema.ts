import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, jsonb, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("user"), // user, admin, superadmin
  name: text("name").notNull(),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const files = pgTable("files", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  filename: text("filename").notNull(),
  originalName: text("original_name").notNull(),
  path: text("path").notNull(),
  status: text("status").notNull().default("pending"), // pending, approved, rejected
  data: jsonb("data"), // parsed Excel data
  uploadedAt: timestamp("uploaded_at").default(sql`now()`),
  approvedBy: varchar("approved_by").references(() => users.id),
  approvedAt: timestamp("approved_at"),
});

export const charts = pgTable("charts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  fileId: varchar("file_id").notNull().references(() => files.id),
  title: text("title").notNull(),
  type: text("type").notNull(), // bar, line, pie, 3d
  xAxis: text("x_axis").notNull(),
  yAxis: text("y_axis").notNull(),
  config: jsonb("config"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const adminRequests = pgTable("admin_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  message: text("message").notNull(),
  status: text("status").notNull().default("pending"), // pending, approved, denied
  requestedAt: timestamp("requested_at").default(sql`now()`),
  reviewedBy: varchar("reviewed_by").references(() => users.id),
  reviewedAt: timestamp("reviewed_at"),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertFileSchema = createInsertSchema(files).omit({
  id: true,
  uploadedAt: true,
  approvedBy: true,
  approvedAt: true,
});

export const insertChartSchema = createInsertSchema(charts).omit({
  id: true,
  createdAt: true,
  userId: true, // userId will be added by the server
});

export const insertAdminRequestSchema = createInsertSchema(adminRequests).omit({
  id: true,
  requestedAt: true,
  reviewedBy: true,
  reviewedAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertFile = z.infer<typeof insertFileSchema>;
export type File = typeof files.$inferSelect;
export type InsertChart = z.infer<typeof insertChartSchema>;
export type Chart = typeof charts.$inferSelect;
export type InsertAdminRequest = z.infer<typeof insertAdminRequestSchema>;
export type AdminRequest = typeof adminRequests.$inferSelect;
