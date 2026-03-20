import express from "express";
import cookieParser from "cookie-parser";
import meetingRouter from "./routes/meeting/meeting.routes";
import authRouter from "./routes/auth/auth.routes";
import { ipCheckMiddleware } from "./middlewares/ipCheckMiddleware";
import morgan from "morgan";
import { limiter } from "./middlewares/rateLimitter";
import { errorHandler } from "./middlewares/errorHandler";
import { errorLogger } from "./middlewares/errorLogger";
import { authMiddleware } from "./middlewares/authMiddleware";
import cors from "cors";
import { CONFIG } from "./config";

const app = express();
app.use(cors({ credentials: true, origin: CONFIG.FRONTEND_ORIGIN }));
app.set("trust proxy", 1);
app.use(cookieParser());
app.use(express.json());
app.use(limiter);
app.use(express.urlencoded({ extended: true }));
app.use(ipCheckMiddleware);

//app.use(express.static("dist", { index: false }));

app.use(morgan("tiny"));

app.get("/health", (_req, res) => {
  const healthcheck = {
    uptime: process.uptime(),
    message: "OK",
    timestamp: Date.now(),
  };
  res.send(healthcheck);
});
app.use("/auth", authRouter);
// Auth only for routes that need it — not for /health or /auth/*
// TODO investigate why doesnt work correctly with app.use(authMiddleware) after auth endpoints
app.use("/meetings", authMiddleware, meetingRouter);
app.use(errorLogger).use(errorHandler);

const PORT = Number(process.env.PORT) || 3001;
const server = app.listen(PORT, () => {
  console.log("Server listening on", PORT);

  if (!process.env.ALLOWED_GOOGLE_DOMAIN) {
    console.warn(
      "ALLOWED_GOOGLE_DOMAIN not set — any Google account will be accepted.",
    );
  }
});

// Graceful shutdown
process.on("SIGTERM", () => {
  if (CONFIG.NODE_ENV === "dev") return;
  console.debug("SIGTERM signal received: closing HTTP server");
  server.close(() => {
    console.debug("HTTP server closed");
  });
});
