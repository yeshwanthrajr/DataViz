import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../shared/schema";

// Database connection
const connectionString = process.env.DATABASE_URL || "postgresql://localhost:5432/fileflowpro";

// Create the connection
const client = postgres(connectionString, { prepare: false });

// Create the database instance
export const db = drizzle(client, { schema });

// Export for use in other files
export { client };