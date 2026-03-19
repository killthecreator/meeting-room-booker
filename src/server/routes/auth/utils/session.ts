import crypto from "crypto";
import { CONFIG } from "../../../config";

export function signSession(payload: object): string {
  const data = JSON.stringify(payload);
  const hmac = crypto.createHmac("sha256", CONFIG.SESSION_SECRET!);
  hmac.update(data);
  return (
    Buffer.from(data).toString("base64url") + "." + hmac.digest("base64url")
  );
}

export function unsignSession(token: string): Record<string, string> | null {
  try {
    const [raw, sig] = token.split(".");
    const hmac = crypto.createHmac("sha256", CONFIG.SESSION_SECRET!);
    hmac.update(Buffer.from(raw, "base64url").toString());
    if (hmac.digest("base64url") !== sig) return null;
    return JSON.parse(Buffer.from(raw, "base64url").toString());
  } catch {
    return null;
  }
}
