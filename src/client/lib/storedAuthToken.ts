import Cookies from "js-cookie";
import { SESSION_COOKIE_KEY } from "../../constants";

export function getStoredToken(): string | undefined {
  return Cookies.get(SESSION_COOKIE_KEY);
}

export function setStoredToken(
  token: string,
  expires: number | undefined | null = undefined,
) {
  Cookies.set(SESSION_COOKIE_KEY, token, { expires: expires ?? undefined });
}

export function cleanStoredToken() {
  Cookies.remove(SESSION_COOKIE_KEY);
}
