import { neon } from "@neondatabase/serverless";
import { drizzle, type NeonHttpDatabase } from "drizzle-orm/neon-http";
import * as schema from "./schema";

let dbInstance: NeonHttpDatabase<typeof schema> | null = null;

export function getDb() {
  if (!process.env.DATABASE_URL) {
    return null;
  }

  if (!dbInstance) {
    const sql = neon(process.env.DATABASE_URL);
    dbInstance = drizzle(sql, { schema });
  }

  return dbInstance;
}
