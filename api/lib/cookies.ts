import type { CookieOptions } from "hono/utils/cookie";

export function getSessionCookieOptions(headers: Headers): CookieOptions {
  const isHttps = headers.get("x-forwarded-proto") === "https";

  return {
    httpOnly: true,
    path: "/",
    sameSite: "Lax",
    secure: isHttps,
  };
}
