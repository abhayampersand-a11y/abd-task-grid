import "server-only";

import { ApiError } from "@/lib/api";
import type { OAuthMode } from "@/lib/oauth-state";

/**
 * Redirect plumbing shared by the OAuth `start` and `callback` routes.
 *
 * `NextResponse.redirect` is avoided on purpose: the native leg targets
 * `taskflow://…`, and a hand-built `Location` header is the one thing
 * guaranteed not to re-validate the custom scheme out of existence.
 */
export function redirectTo(location: string): Response {
  return new Response(null, {
    status: 302,
    headers: { location, "cache-control": "no-store" },
  });
}

function withParams(target: string, params: Record<string, string>): string {
  const separator = target.includes("?") ? "&" : "?";
  const query = new URLSearchParams(params).toString();
  return `${target}${separator}${query}`;
}

/**
 * Hands the browser back to whoever started the flow.
 *
 * Native gets the session token on the deep link — the app is holding a
 * `WebBrowser` session open waiting for exactly this URL. Web has the session
 * cookie already, so it only needs the destination.
 */
export function oauthSuccess(options: {
  mode: OAuthMode;
  returnTo: string;
  token: string;
}): Response {
  if (options.mode === "native") {
    return redirectTo(withParams(options.returnTo, { token: options.token }));
  }
  return redirectTo(options.returnTo);
}

/**
 * Turns a thrown error into a redirect the user can actually read.
 *
 * A JSON error body would be a dead end here: the user is sitting in a browser
 * tab, not looking at a fetch response.
 */
export function oauthFailure(
  error: unknown,
  options: { mode: OAuthMode; returnTo: string },
): Response {
  const message =
    error instanceof ApiError
      ? error.message
      : "Could not complete sign-in. Please try again.";

  if (!(error instanceof ApiError)) console.error("[oauth]", error);

  if (options.mode === "native") {
    return redirectTo(
      withParams(options.returnTo, {
        error: message,
        // A flag, not a message match: the app stays silent when the user
        // simply backed out, and the wording is free to change.
        ...(error instanceof CancelledError ? { cancelled: "1" } : {}),
      }),
    );
  }
  return redirectTo(withParams("/sign-in", { error: message }));
}

/** Raised when the user backed out at the provider's consent screen. */
export class CancelledError extends ApiError {
  constructor() {
    super(400, "Sign-in was cancelled.");
  }
}

/** The provider bounced the user back without a code. */
export function providerError(
  code: string,
  description: string | null,
): ApiError {
  if (code === "access_denied") return new CancelledError();
  console.error("[oauth] provider error", code, description);
  return new ApiError(400, description || "The provider refused the sign-in.");
}
