import { OAuth2Client } from "google-auth-library";
import { ENV } from "./env";

export const oAuth2Client = new OAuth2Client(
  ENV.GOOGLE_CLIENT_ID,
  ENV.GOOGLE_CLIENT_SECRET,
  "postmessage",
);
