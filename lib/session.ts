import "server-only";

import { cookies, headers } from "next/headers";
import {
  SESSION_COOKIE,
  SESSION_MAX_AGE,
  signSession,
  verifySession,
  type SessionPayload,
} from "./jwt";

export { SESSION_COOKIE, type SessionPayload };

/**
 * Sets the session cookie and returns the raw token.
 *
 * The browser only needs the cookie; native clients (the Expo app) have no
 * cookie jar, so the auth routes hand them the returned token to store
 * themselves and replay as a bearer header.
 */
export async function createSessionCookie(
  payload: SessionPayload,
  remember = false,
): Promise<string> {
  const maxAge = remember ? SESSION_MAX_AGE * 4 : SESSION_MAX_AGE;
  const token = await signSession(payload, maxAge);
  const store = await cookies();

  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge,
  });

  return token;
}

export async function destroySessionCookie() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

/**
 * Cookie first (the web app), then `Authorization: Bearer` (native clients).
 * Both carry the same signed token, so nothing downstream needs to know which
 * transport was used.
 */
export async function readSession(): Promise<SessionPayload | null> {
  const store = await cookies();
  const fromCookie = await verifySession(store.get(SESSION_COOKIE)?.value);
  if (fromCookie) return fromCookie;

  const authorization = (await headers()).get("authorization");
  if (!authorization?.toLowerCase().startsWith("bearer ")) return null;

  return verifySession(authorization.slice(7).trim() || undefined);
}
