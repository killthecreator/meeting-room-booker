import type { RequestHandler } from "express";

import { CONFIG } from "../../config";
import { OAuth2Client, UserRefreshClient } from "google-auth-library";

const oAuth2Client = new OAuth2Client(
  CONFIG.GOOGLE_CLIENT_ID,
  CONFIG.GOOGLE_CLIENT_SECRET,
  "postmessage",
);

export const authController = {
  async setSession(req, res) {
    const { tokens } = await oAuth2Client.getToken(req.body.code); // exchange code for tokens

    res.status(200).json(tokens);
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
