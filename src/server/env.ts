import z from "zod";

const envSchema = z.object({
  GOOGLE_CLIENT_ID: z.string(),
  GOOGLE_CLIENT_SECRET: z.string(),
  FRONTEND_ORIGIN: z.string(),
  NODE_ENV: z.union([z.literal("dev"), z.literal("production")]).default("dev"),
  PORT: z.coerce.number().default(3001),
  JWT_SECRET: z.string(),
});

export const ENV = envSchema.parse(process.env);
