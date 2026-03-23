import { OAuth2Client } from "google-auth-library";
import { ENV } from "../../env";
import { AuthenticationError } from "../../lib/customErrors";
import { GOOGLE_CLIENT_ID } from "../../config";

export const oAuth2Client = new OAuth2Client(
  GOOGLE_CLIENT_ID,
  ENV.GOOGLE_CLIENT_SECRET,
  "postmessage",
);

export const authService = {
  async getToken(code: string) {
    return oAuth2Client.getToken(code);
  },

  async verifyToken(authToken: string) {
    try {
      const ticket = await oAuth2Client.verifyIdToken({
        idToken: authToken,
        audience: GOOGLE_CLIENT_ID,
      });
      return ticket;
    } catch {
      throw new AuthenticationError("Unauthorized");
    }
  },
};
