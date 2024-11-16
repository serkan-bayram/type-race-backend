import dotenv from "dotenv";
import { drizzle } from "drizzle-orm/node-postgres";

dotenv.config({ path: process.cwd() + "/.env.local" });

export const db = drizzle({
  connection: process.env.DATABASE_URL!,
  casing: "snake_case",
});
