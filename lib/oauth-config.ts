/**
 * Provider metadata, with no dependency on the database or the request.
 *
 * Split out from `lib/oauth.ts` so a server component can ask which buttons to
 * render without pulling the Prisma client and `pg` into a page bundle that
 * has no use for either.
 */

export const OAUTH_PROVIDERS = ["google", "microsoft", "linkedin"] as const;
export type OAuthProviderId = (typeof OAUTH_PROVIDERS)[number];

export function isOAuthProvider(value: string): value is OAuthProviderId {
  return (OAUTH_PROVIDERS as readonly string[]).includes(value);
}

export interface ProviderDefinition {
  label: string;
  /** The `OAuthProvider` enum member this maps to in the database. */
  dbValue: "GOOGLE" | "MICROSOFT" | "LINKEDIN";
  scope: string;
  /**
   * LinkedIn's authorization server rejects `code_challenge` outright, so PKCE
   * is opt-in per provider rather than assumed.
   */
  usesPkce: boolean;
  authorizeUrl: string;
  tokenUrl: string;
  userInfoUrl: string;
  /** Provider-specific extras appended to the authorize URL. */
  authorizeParams?: Record<string, string>;
  envPrefix: string;
}

function microsoftTenant() {
  return process.env.MICROSOFT_TENANT_ID?.trim() || "common";
}

export const PROVIDER_DEFINITIONS: Record<OAuthProviderId, ProviderDefinition> =
  {
    google: {
      label: "Google",
      dbValue: "GOOGLE",
      scope: "openid email profile",
      usesPkce: true,
      authorizeUrl: "https://accounts.google.com/o/oauth2/v2/auth",
      tokenUrl: "https://oauth2.googleapis.com/token",
      userInfoUrl: "https://openidconnect.googleapis.com/v1/userinfo",
      // Without this, Google silently reuses the only signed-in account and
      // the "switch account" affordance never appears.
      authorizeParams: { prompt: "select_account" },
      envPrefix: "GOOGLE",
    },
    microsoft: {
      label: "Microsoft",
      dbValue: "MICROSOFT",
      scope: "openid email profile",
      usesPkce: true,
      get authorizeUrl() {
        return `https://login.microsoftonline.com/${microsoftTenant()}/oauth2/v2.0/authorize`;
      },
      get tokenUrl() {
        return `https://login.microsoftonline.com/${microsoftTenant()}/oauth2/v2.0/token`;
      },
      userInfoUrl: "https://graph.microsoft.com/oidc/userinfo",
      authorizeParams: { prompt: "select_account" },
      envPrefix: "MICROSOFT",
    },
    linkedin: {
      label: "LinkedIn",
      dbValue: "LINKEDIN",
      // "Sign In with LinkedIn using OpenID Connect" — the older r_liteprofile
      // and r_emailaddress scopes are retired and will be rejected.
      scope: "openid profile email",
      usesPkce: false,
      authorizeUrl: "https://www.linkedin.com/oauth/v2/authorization",
      tokenUrl: "https://www.linkedin.com/oauth/v2/accessToken",
      userInfoUrl: "https://api.linkedin.com/v2/userinfo",
      envPrefix: "LINKEDIN",
    },
  };

/** Whether a provider is usable, for rendering only the buttons that work. */
export function configuredProviders(): OAuthProviderId[] {
  return OAUTH_PROVIDERS.filter((id) => {
    const { envPrefix } = PROVIDER_DEFINITIONS[id];
    return Boolean(
      process.env[`${envPrefix}_CLIENT_ID`] &&
        process.env[`${envPrefix}_CLIENT_SECRET`],
    );
  });
}

export function providerLabel(id: OAuthProviderId): string {
  return PROVIDER_DEFINITIONS[id].label;
}

export function providerDbValue(id: OAuthProviderId) {
  return PROVIDER_DEFINITIONS[id].dbValue;
}
