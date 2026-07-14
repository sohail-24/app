import * as cookie from "cookie";
import { SignJWT, jwtVerify } from "jose";
import { Session } from "@contracts/constants";
import type { User } from "@db/schema";
import { env } from "../lib/env";
import { getSessionCookieOptions } from "../lib/cookies";
import {
  findUserById,
  updateUserRefreshTokenHash,
} from "../queries/users";
import { hashSecret, verifySecret } from "./password";

const encoder = new TextEncoder();

type SessionTokenType = "access" | "refresh";

function keyFor(type: SessionTokenType) {
  return encoder.encode(
    type === "access" ? env.jwtAccessSecret : env.jwtRefreshSecret,
  );
}

async function signToken(user: User, type: SessionTokenType) {
  const maxAge =
    type === "access" ? Session.accessMaxAgeMs : Session.refreshMaxAgeMs;

  return new SignJWT({
    typ: type,
    role: user.role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(String(user.id))
    .setIssuedAt()
    .setExpirationTime(Math.floor((Date.now() + maxAge) / 1000))
    .sign(keyFor(type));
}

async function verifyToken(token: string, type: SessionTokenType) {
  const result = await jwtVerify(token, keyFor(type));
  if (result.payload.typ !== type || !result.payload.sub) {
    throw new Error("Invalid token type");
  }
  return Number(result.payload.sub);
}

function appendSessionCookie(
  headers: Headers,
  requestHeaders: Headers,
  name: string,
  value: string,
  maxAgeMs: number,
) {
  const opts = getSessionCookieOptions(requestHeaders);
  headers.append(
    "set-cookie",
    cookie.serialize(name, value, {
      httpOnly: opts.httpOnly,
      path: opts.path,
      sameSite: opts.sameSite?.toLowerCase() as "lax" | "none",
      secure: opts.secure,
      maxAge: Math.floor(maxAgeMs / 1000),
    }),
  );
}

export async function issueSessionCookies(
  user: User,
  requestHeaders: Headers,
  responseHeaders: Headers,
) {
  const accessToken = await signToken(user, "access");
  const refreshToken = await signToken(user, "refresh");

  await updateUserRefreshTokenHash(user.id, await hashSecret(refreshToken));

  appendSessionCookie(
    responseHeaders,
    requestHeaders,
    Session.accessCookieName,
    accessToken,
    Session.accessMaxAgeMs,
  );
  appendSessionCookie(
    responseHeaders,
    requestHeaders,
    Session.refreshCookieName,
    refreshToken,
    Session.refreshMaxAgeMs,
  );
}

export function clearSessionCookies(
  requestHeaders: Headers,
  responseHeaders: Headers,
) {
  const opts = getSessionCookieOptions(requestHeaders);
  for (const name of [Session.accessCookieName, Session.refreshCookieName]) {
    responseHeaders.append(
      "set-cookie",
      cookie.serialize(name, "", {
        httpOnly: opts.httpOnly,
        path: opts.path,
        sameSite: opts.sameSite?.toLowerCase() as "lax" | "none",
        secure: opts.secure,
        maxAge: 0,
      }),
    );
  }
}

export async function authenticateRequest(
  requestHeaders: Headers,
  responseHeaders?: Headers,
) {
  const cookies = cookie.parse(requestHeaders.get("cookie") ?? "");
  const accessToken = cookies[Session.accessCookieName];
  const refreshToken = cookies[Session.refreshCookieName];

  if (accessToken) {
    const userId = await verifyToken(accessToken, "access");
    const user = await findUserById(userId);
    if (user?.isActive) return user;
  }

  if (!refreshToken || !responseHeaders) {
    throw new Error("Authentication required");
  }

  const userId = await verifyToken(refreshToken, "refresh");
  const user = await findUserById(userId);
  if (!user?.isActive || !user.refreshTokenHash) {
    throw new Error("Invalid refresh token");
  }

  const refreshMatches = await verifySecret(refreshToken, user.refreshTokenHash);
  if (!refreshMatches) {
    throw new Error("Invalid refresh token");
  }

  await issueSessionCookies(user, requestHeaders, responseHeaders);
  return user;
}
