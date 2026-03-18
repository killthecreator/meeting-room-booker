import express from "express";
import cookieParser from "cookie-parser";
import meetingRouter from "./routes/meeting/meeting.routes";
import authRouter from "./routes/auth/auth.routes";
import { ipCheckMiddleware } from "./middlewares/ipCheckMiddleware";
import morgan from "morgan";
import { limiter } from "./middlewares/rateLimitter";

const app = express();
app.set("trust proxy", 1);
app.use(cookieParser());
app.use(express.json());
app.use(limiter);
app.use(express.urlencoded({ extended: true }));
app.use(ipCheckMiddleware);

app.use(express.static("dist", { index: false }));

app.use(morgan("tiny"));
app.use("/api/auth", authRouter);
app.use("/api/meetings", meetingRouter);

const PORT = Number(process.env.PORT) || 3001;
app.listen(PORT, () => {
  console.log("Server listening on", PORT);

  const redirectUri =
    process.env.GOOGLE_REDIRECT_URI ||
    `http://localhost:${PORT}/api/auth/google/callback`;

  console.log(
    "Google Redirect URI (set in Google Cloud Console):",
    redirectUri,
  );

  if (!process.env.ALLOWED_GOOGLE_DOMAIN) {
    console.warn(
      "ALLOWED_GOOGLE_DOMAIN not set — any Google account will be accepted.",
    );
  }
});
