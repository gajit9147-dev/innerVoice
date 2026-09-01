import "dotenv/config";
import { z } from "zod";

// Railway provides MySQL variables as MYSQLHOST, MYSQLUSER, etc.
// Map them to our DB_* variables so the app works on Railway without manual config.
if (process.env.MYSQLHOST && !process.env.DB_HOST) {
  process.env.DB_HOST = process.env.MYSQLHOST;
}
if (process.env.MYSQLUSER && !process.env.DB_USER) {
  process.env.DB_USER = process.env.MYSQLUSER;
}
if (process.env.MYSQLPASSWORD && !process.env.DB_PASSWORD) {
  process.env.DB_PASSWORD = process.env.MYSQLPASSWORD;
}
if (process.env.MYSQLDATABASE && !process.env.DB_NAME) {
  process.env.DB_NAME = process.env.MYSQLDATABASE;
}
if (process.env.MYSQLPORT && !process.env.DB_PORT) {
  process.env.DB_PORT = process.env.MYSQLPORT;
}

const envSchema = z.object({
  PORT: z.string().default("5000"),

  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),

  JWT_SECRET: z
    .string()
    .min(10, "JWT_SECRET must be at least 10 characters"),

  GEMINI_API_KEY: z.string().min(1),

  DB_HOST: z.string(),

  DB_USER: z.string(),

  DB_PASSWORD: z.string(),

  DB_NAME: z.string(),

  DB_PORT: z.string().optional(),

  CLOUDINARY_CLOUD_NAME: z.string(),

  CLOUDINARY_API_KEY: z.string(),

  CLOUDINARY_API_SECRET: z.string(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("\n❌ Invalid environment configuration\n");

  console.table(parsed.error.flatten().fieldErrors);

  process.exit(1);
}

export default parsed.data;
