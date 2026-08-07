import type { NextRequest } from "next/server";
import { ApiError } from "@/lib/api";
import {
  authorizeUrlFor,
  isOAuthProvider,
  redirectUri,
  resolveProvider,
} from "@/lib/oauth";
import {
  codeChallengeFor,
  createCodeVerifier,
  createNonce,
  sanitiseReturnTo,
  signState,
  storeTransaction,
  type OAuthMode,
} from "@/lib/oauth-state";
import { oauthFailure, redirectTo } from "../../shared";

/**
 * Kicks off a social sign-in.
 *
 * The Expo app opens this URL in a system browser with
 * `?mode=native&redirect=<its own deep link>`; the web app links here with
 * `?next=/dashboard`. Everything after this is the provider's redirect back to
 * the sibling `callback` route.
 */
export async function GET(
  request: NextRequest,
  ctx: RouteContext<"/api/auth/oauth/[provider]/start">,
) {
  const { provider: raw } = await ctx.params;
  const url = new URL(request.url);
  const mode: OAuthMode =
    url.searchParams.get("mode") === "native" ? "native" : "web";
  const returnTo = sanitiseReturnTo(
    url.searchParams.get(mode === "native" ? "redirect" : "next"),
    mode,
  );

  try {
    if (!isOAuthProvider(raw)) {
      throw new ApiError(404, "Unknown sign-in provider.");
    }
    const provider = resolveProvider(raw);

    const nonce = createNonce();
    const codeVerifier = createCodeVerifier();
    await storeTransaction({ nonce, codeVerifier });

    const state = await signState({ provider: raw, mode, returnTo, nonce });

    return redirectTo(
      authorizeUrlFor(provider, {
        state,
        redirectUri: redirectUri(raw, request),
        codeChallenge: provider.usesPkce
          ? await codeChallengeFor(codeVerifier)
          : undefined,
      }),
    );
  } catch (error) {
    return oauthFailure(error, { mode, returnTo });
  }
}
