import z from "zod";

const envSchema = z.object({
  GOOGLE_CLIENT_SECRET: z.string(),
  FRONTEND_ORIGIN: z.string(),
  NODE_ENV: z.union([z.literal("dev"), z.literal("production")]).default("dev"),
  PORT: z.coerce.number().default(3001),
  DB_HOST: z.string(),
  DB_PORT: z.coerce.number().default(5432),
  DB_USER: z.string(),
  DB_PASSWORD: z.string(),
  DB_DATABASE: z.string(),
});

export const ENV = envSchema.parse(process.env);
