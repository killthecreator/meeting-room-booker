import type { Request } from "express";
import { oAuth2Client } from "../oauthClient";
import { getAuthToken } from "./getAuthToken";
import { AuthenticationError } from "../lib/customErrors";
import { ENV } from "../env";

export const verifyAuthToken = async (req: Request) => {
  const authToken = getAuthToken(req);
  if (!authToken) throw new AuthenticationError("Unauthorized");
  try {
    const ticket = await oAuth2Client.verifyIdToken({
      idToken: authToken,
      audience: ENV.GOOGLE_CLIENT_ID,
    });
    return ticket;
  } catch {
    throw new AuthenticationError("Unauthorized");
  }
};
