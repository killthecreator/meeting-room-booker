import type { RequestHandler } from "express";

import { CONFIG } from "../../config";
import { OAuth2Client, UserRefreshClient } from "google-auth-library";
import { getAuthToken } from "./utils/getAuthToken";
import { googleAuthSchema } from "../../../schemas/authUser";

const oAuth2Client = new OAuth2Client(
  CONFIG.GOOGLE_CLIENT_ID,
  CONFIG.GOOGLE_CLIENT_SECRET,
  "postmessage",
);

export const authController = {
  async generateSession(req, res) {
    const { tokens } = await oAuth2Client.getToken(req.body.code); // exchange code for tokens

    res.json(tokens);
  },

  async verifyToken(req, res) {
    const authToken = getAuthToken(req);
    if (!authToken) return res.status(200).send();

    const ticket = await oAuth2Client.verifyIdToken({
      idToken: authToken,
      audience: CONFIG.GOOGLE_CLIENT_ID,
    });

    res.json(googleAuthSchema.parse(ticket.getPayload()));
  },

  async refreshToken(req, res) {
    const user = new UserRefreshClient(
      CONFIG.GOOGLE_CLIENT_ID,
      CONFIG.GOOGLE_CLIENT_SECRET,
      req.body.refreshToken,
    );
    const { credentials } = await user.refreshAccessToken(); // obtain new tokens
    res.json(credentials);
  },
} satisfies Record<string, RequestHandler>;
