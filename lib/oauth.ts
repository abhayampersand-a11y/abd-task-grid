import "server-only";

import { ApiError } from "./api";
import {
  PROVIDER_DEFINITIONS,
  type OAuthProviderId,
  type ProviderDefinition,
} from "./oauth-config";

/**
 * Social sign-in, brokered entirely by this server.
 *
 * The Expo app does *not* talk to Google/Microsoft/LinkedIn directly. It opens
 * `/api/auth/oauth/{provider}/start` in a system browser, we run the whole
 * authorization-code exchange here, and we hand the app back the same signed
 * session token that `/api/auth/sign-in` returns. That is not just tidiness:
 * LinkedIn has no PKCE support and demands a client secret on the token call,
 * which a public mobile client can never hold safely.
 *
 * Provider metadata lives in `oauth-config.ts`; this module is the part that
 * needs the network and the database.
 */

export {
  OAUTH_PROVIDERS,
  isOAuthProvider,
  providerDbValue,
  providerLabel,
  type OAuthProviderId,
} from "./oauth-config";

/** Normalised claims — every provider below speaks OIDC, so one shape fits. */
export interface OAuthProfile {
  providerAccountId: string;
  email: string | null;
  emailVerified: boolean;
  fullName: string | null;
  avatarUrl: string | null;
}

export interface ResolvedProvider extends ProviderDefinition {
  id: OAuthProviderId;
  clientId: string;
  clientSecret: string;
}

/**
 * Reads the provider's credentials from the environment.
 *
 * Throws rather than returning null: an unconfigured provider is a deployment
 * mistake, and a 503 naming the missing variable is far easier to act on than
 * a redirect loop.
 */
export function resolveProvider(id: OAuthProviderId): ResolvedProvider {
  const definition = PROVIDER_DEFINITIONS[id];
  const clientId = process.env[`${definition.envPrefix}_CLIENT_ID`];
  const clientSecret = process.env[`${definition.envPrefix}_CLIENT_SECRET`];

  if (!clientId || !clientSecret) {
    throw new ApiError(
      503,
      `${definition.label} sign-in is not configured on this server. Set ${definition.envPrefix}_CLIENT_ID and ${definition.envPrefix}_CLIENT_SECRET.`,
    );
  }

  return { ...definition, id, clientId, clientSecret };
}

/**
 * The redirect URI registered with each provider.
 *
 * It must match the console entry byte for byte, so it is pinned to `APP_URL`
 * rather than derived from the incoming request — behind a proxy the two
 * differ, and the mismatch surfaces as an opaque `redirect_uri_mismatch`.
 */
export function redirectUri(id: OAuthProviderId, request: Request): string {
  const configured = process.env.APP_URL?.trim().replace(/\/+$/, "");
  const origin = configured || new URL(request.url).origin;
  return `${origin}/api/auth/oauth/${id}/callback`;
}

export function authorizeUrlFor(
  provider: ResolvedProvider,
  options: { state: string; redirectUri: string; codeChallenge?: string },
): string {
  const url = new URL(provider.authorizeUrl);
  url.searchParams.set("client_id", provider.clientId);
  url.searchParams.set("redirect_uri", options.redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", provider.scope);
  url.searchParams.set("state", options.state);

  for (const [key, value] of Object.entries(provider.authorizeParams ?? {})) {
    url.searchParams.set(key, value);
  }

  if (provider.usesPkce && options.codeChallenge) {
    url.searchParams.set("code_challenge", options.codeChallenge);
    url.searchParams.set("code_challenge_method", "S256");
  }

  return url.toString();
}

/** Swaps the authorization code for an access token. */
export async function exchangeCode(
  provider: ResolvedProvider,
  options: { code: string; redirectUri: string; codeVerifier?: string },
): Promise<string> {
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code: options.code,
    redirect_uri: options.redirectUri,
    client_id: provider.clientId,
    client_secret: provider.clientSecret,
  });

  if (provider.usesPkce && options.codeVerifier) {
    body.set("code_verifier", options.codeVerifier);
  }

  const response = await fetch(provider.tokenUrl, {
    method: "POST",
    headers: {
      "content-type": "application/x-www-form-urlencoded",
      accept: "application/json",
    },
    body,
    cache: "no-store",
  });

  const payload = (await response.json().catch(() => null)) as {
    access_token?: string;
    error?: string;
    error_description?: string;
  } | null;

  if (!response.ok || !payload?.access_token) {
    // The provider's own wording ("invalid_grant", "redirect_uri_mismatch") is
    // the only useful clue here, so keep it in the log.
    console.error(`[oauth:${provider.id}] token exchange failed`, payload);
    throw new ApiError(
      502,
      `${provider.label} rejected the sign-in attempt. Please try again.`,
    );
  }

  return payload.access_token;
}

/** Reads the OIDC userinfo endpoint and normalises the claims. */
export async function fetchProfile(
  provider: ResolvedProvider,
  accessToken: string,
): Promise<OAuthProfile> {
  const response = await fetch(provider.userInfoUrl, {
    headers: { authorization: `Bearer ${accessToken}`, accept: "application/json" },
    cache: "no-store",
  });

  if (!response.ok) {
    console.error(
      `[oauth:${provider.id}] userinfo failed`,
      response.status,
      await response.text().catch(() => ""),
    );
    throw new ApiError(
      502,
      `Could not read your ${provider.label} profile. Please try again.`,
    );
  }

  const claims = (await response.json()) as Record<string, unknown>;
  const sub = typeof claims.sub === "string" ? claims.sub : null;
  if (!sub) {
    throw new ApiError(502, `${provider.label} returned an unusable profile.`);
  }

  const email =
    pickString(claims.email) ??
    // Microsoft work accounts sometimes carry the address here instead.
    pickString(claims.preferred_username);

  const given = pickString(claims.given_name);
  const family = pickString(claims.family_name);

  return {
    providerAccountId: sub,
    email: email?.toLowerCase() ?? null,
    // Absent means "the provider did not say". Only Google and LinkedIn emit
    // this claim; Microsoft-issued addresses are directory-owned, so treating
    // silence as verified matches how these accounts actually work.
    emailVerified: claims.email_verified !== false,
    fullName:
      pickString(claims.name) ??
      ([given, family].filter(Boolean).join(" ").trim() || null),
    avatarUrl: pickString(claims.picture) ?? null,
  };
}

function pickString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}
