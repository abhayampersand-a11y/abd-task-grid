# Social sign-in (Google, Microsoft, LinkedIn)

## How it works

All three providers run through **one server-brokered flow**. The Expo app
never holds a client secret and never calls a provider directly:

```
app  ──▶ GET /api/auth/oauth/{provider}/start?mode=native&redirect=taskflow://oauth-callback
                │  signs a state JWT, stores the PKCE verifier in an httpOnly cookie
                ▼
         provider consent screen
                │
                ▼
         GET /api/auth/oauth/{provider}/callback?code=…&state=…
                │  exchanges the code (server-side, with the client secret),
                │  reads OIDC userinfo, finds or creates the User + OAuthAccount
                ▼
app  ◀── 302 taskflow://oauth-callback?token=<session JWT>
```

The token is the same one `/api/auth/sign-in` returns, so everything
downstream — `Authorization: Bearer`, `readSession`, the `AuthGate` — is
unchanged.

The web app uses the identical routes with `?next=/dashboard`; it gets the
httpOnly session cookie instead of a deep link.

**Why server-brokered rather than PKCE in the app:** LinkedIn's token endpoint
requires `client_secret` and rejects `code_challenge` outright. A public mobile
client cannot hold that secret. Google and Microsoft still get PKCE — see
`usesPkce` in `lib/oauth-config.ts`.

## Files

| Path | Role |
| --- | --- |
| `lib/oauth-config.ts` | Provider metadata, env lookup. No DB import, so server components can read it. |
| `lib/oauth.ts` | Token exchange + userinfo. |
| `lib/oauth-state.ts` | Signed `state`, PKCE verifier cookie, `redirect` allowlist. |
| `app/api/auth/oauth/[provider]/start` | Builds the authorize URL. |
| `app/api/auth/oauth/[provider]/callback` | Exchange, account resolution, session. |
| `app/api/auth/oauth/providers` | Which buttons the Expo app should render. |
| `components/auth/social-sign-in.tsx` | The web button row. |

## Console setup

Set `APP_URL` first — every redirect URI is derived from it and must match the
console entry **byte for byte**:

```
{APP_URL}/api/auth/oauth/google/callback
{APP_URL}/api/auth/oauth/microsoft/callback
{APP_URL}/api/auth/oauth/linkedin/callback
```

**Google** — console.cloud.google.com → APIs & Services → Credentials → Create
OAuth client ID → *Web application*. Add the redirect URI above. Configure the
OAuth consent screen with the `email`, `profile` and `openid` scopes.

**Microsoft** — portal.azure.com → Entra ID → App registrations → New
registration. Redirect URI platform must be **Web** (not "Mobile and desktop").
Create a secret under Certificates & secrets. `MICROSOFT_TENANT_ID` defaults to
`common`; set a tenant GUID to restrict sign-in to one organisation.

**LinkedIn** — developer.linkedin.com → your app → Products → add **Sign In
with LinkedIn using OpenID Connect**, then Auth → add the redirect URL. Without
that product the `openid profile email` scopes are rejected.

Leaving a `*_CLIENT_ID` / `*_CLIENT_SECRET` pair blank simply hides that
provider's button.

## Account rules

- Matching is by the provider's `sub` first, then by **verified** email — so
  Google and Microsoft on the same address land on one account.
- An unverified provider email is never allowed to reach an existing account.
- New social accounts have `passwordHash = null` and `mobile = null`. Password
  sign-in rejects them (same generic message, no account enumeration), and the
  profile screen offers "Set a password" instead of "Change password".

## Testing locally

The mobile deep link is `Linking.createURL("oauth-callback")`, which resolves
to `taskflow://oauth-callback` in a dev/EAS build and to Metro's
`exp://<lan-ip>:8081/--/oauth-callback` under Expo Go. `sanitiseReturnTo` only
accepts `exp://` and private-range `http://` **outside production**, so a
deployed (production) server always sends the user to `taskflow://` — Expo Go
cannot be tested against the deployed API.

Note also that Google rejects `http://192.168.x.x` as a redirect URI: local
end-to-end testing needs either a tunnel (`ngrok`, `expo start --tunnel`) with
that origin registered, or a dev build pointed at the deployed API.
