import z from "zod";

const envSchema = z.object({
  GOOGLE_CLIENT_ID: z.string(),
  GOOGLE_CLIENT_SECRET: z.string(),
  GOOGLE_REDIRECT_URI: z.string(),
  ALLOWED_GOOGLE_DOMAIN: z.string().optional(),
  SESSION_SECRET: z.string(),
  FRONTEND_ORIGIN: z.string().default("http://localhost:5173"),
  NODE_ENV: z
    .union([z.literal("dev"), z.literal("production")])
    .default("dev"),
});

const env = envSchema.parse(process.env);

export const CONFIG = {
  ...env,
  GOOGLE_TOKEN: "https://oauth2.googleapis.com/token",
} as const;
