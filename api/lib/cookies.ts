import type { CookieOptions } from "hono/utils/cookie";

export function getSessionCookieOptions(headers: Headers): CookieOptions {
  const isHttps =
    headers.get("x-forwarded-proto") === "https" ||
    process.env.NODE_ENV === "production";

  return {
    httpOnly: true,
    path: "/",
    sameSite: isHttps ? "None" : "Lax",
    secure: isHttps,
  };
}
