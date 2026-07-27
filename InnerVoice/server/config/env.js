import "dotenv/config";
import { z } from "zod";

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
