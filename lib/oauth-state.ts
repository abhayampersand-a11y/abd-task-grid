import "server-only";

import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import { secretKey } from "./jwt";
import { ApiError } from "./api";
import { OAUTH_PROVIDERS, type OAuthProviderId } from "./oauth-config";

/**
 * The two halves of a single sign-in attempt.
 *
 * `state` travels to the provider and back, so it carries only what is safe to
 * show them: which provider, where to land afterwards, and a random nonce. The
 * PKCE verifier stays in an httpOnly cookie on our own origin — putting it in
 * `state` would hand it to anyone who can see the redirect and defeat the
 * point of PKCE entirely.
 */

const TRANSACTION_COOKIE = "taskflow_oauth";
/** Long enough to log in with a password manager, short enough to be useless if leaked. */
const TRANSACTION_MAX_AGE = 10 * 60;

/** Where the browser should end up once the callback has a session. */
export type OAuthMode = "web" | "native";

export interface OAuthState {
  provider: OAuthProviderId;
  mode: OAuthMode;
  /** Web: a path on this origin. Native: the app's deep link. */
  returnTo: string;
  nonce: string;
}

function base64url(bytes: Uint8Array): string {
  return Buffer.from(bytes).toString("base64url");
}

function randomToken(byteLength = 32): string {
  return base64url(crypto.getRandomValues(new Uint8Array(byteLength)));
}

export function createNonce() {
  return randomToken(16);
}

export function createCodeVerifier() {
  return randomToken(32);
}

export async function codeChallengeFor(verifier: string): Promise<string> {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(verifier),
  );
  return base64url(new Uint8Array(digest));
}

export async function signState(state: OAuthState): Promise<string> {
  return new SignJWT({ ...state })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${TRANSACTION_MAX_AGE}s`)
    .sign(secretKey());
}

export async function verifyState(
  token: string | null,
): Promise<OAuthState | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey(), {
      algorithms: ["HS256"],
    });
    const provider = payload.provider;
    if (
      typeof provider !== "string" ||
      !(OAUTH_PROVIDERS as readonly string[]).includes(provider) ||
      typeof payload.returnTo !== "string" ||
      typeof payload.nonce !== "string"
    ) {
      return null;
    }
    return {
      provider: provider as OAuthProviderId,
      mode: payload.mode === "native" ? "native" : "web",
      returnTo: payload.returnTo,
      nonce: payload.nonce,
    };
  } catch {
    return null;
  }
}

/**
 * Stashes the PKCE verifier for the duration of the round trip.
 *
 * `sameSite: "lax"` is deliberate — the callback arrives as a top-level GET
 * navigation from the provider, which Lax allows but Strict would drop.
 */
export async function storeTransaction(input: {
  nonce: string;
  codeVerifier: string;
}) {
  const token = await new SignJWT({ ...input })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${TRANSACTION_MAX_AGE}s`)
    .sign(secretKey());

  const store = await cookies();
  store.set(TRANSACTION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/api/auth/oauth",
    maxAge: TRANSACTION_MAX_AGE,
  });
}

/**
 * Reads and clears the transaction, checking it belongs to this `state`.
 *
 * A mismatch means the callback did not originate from the `/start` we issued
 * — the exact shape of a CSRF login attempt — so it is a hard failure.
 */
export async function consumeTransaction(
  expectedNonce: string,
): Promise<{ codeVerifier: string }> {
  const store = await cookies();
  const token = store.get(TRANSACTION_COOKIE)?.value;
  store.delete({ name: TRANSACTION_COOKIE, path: "/api/auth/oauth" });

  const mismatch = new ApiError(
    400,
    "This sign-in link is no longer valid. Please start again.",
  );
  if (!token) throw mismatch;

  try {
    const { payload } = await jwtVerify(token, secretKey(), {
      algorithms: ["HS256"],
    });
    if (
      payload.nonce !== expectedNonce ||
      typeof payload.codeVerifier !== "string"
    ) {
      throw mismatch;
    }
    return { codeVerifier: payload.codeVerifier };
  } catch {
    throw mismatch;
  }
}

/**
 * Guards the `redirect` the app hands us, so `/start` can never be turned into
 * an open redirector that forwards a fresh session token to a stranger.
 *
 * Native: the app's own scheme only. `exp://` is allowed outside production so
 * the flow still works under Expo Go, where the deep link is Metro's URL.
 */
export function sanitiseReturnTo(
  raw: string | null,
  mode: OAuthMode,
): string {
  if (mode === "web") {
    return raw && raw.startsWith("/") && !raw.startsWith("//")
      ? raw
      : "/dashboard";
  }

  const fallback = "taskflow://oauth-callback";
  if (!raw) return fallback;

  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return fallback;
  }

  const allowed = ["taskflow:"];
  if (process.env.NODE_ENV !== "production") {
    allowed.push("exp:", "exps:", "http:");
  }
  if (!allowed.includes(url.protocol)) return fallback;
  // In dev the Expo deep link is an http(s) Metro URL; keep it to loopback and
  // private ranges so a production-shaped host can never sneak through.
  if (url.protocol === "http:" && !isLocalHost(url.hostname)) return fallback;

  return url.toString();
}

function isLocalHost(hostname: string): boolean {
  return (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    /^192\.168\./.test(hostname) ||
    /^10\./.test(hostname) ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(hostname)
  );
}
