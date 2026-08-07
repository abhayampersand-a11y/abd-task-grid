import type { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { ApiError } from "@/lib/api";
import { signSession } from "@/lib/jwt";
import { createSessionCookie } from "@/lib/session";
import {
  exchangeCode,
  fetchProfile,
  isOAuthProvider,
  providerDbValue,
  redirectUri,
  resolveProvider,
  type OAuthProfile,
  type OAuthProviderId,
} from "@/lib/oauth";
import { consumeTransaction, verifyState } from "@/lib/oauth-state";
import { oauthFailure, oauthSuccess, providerError } from "../../shared";

export async function GET(
  request: NextRequest,
  ctx: RouteContext<"/api/auth/oauth/[provider]/callback">,
) {
  const { provider: raw } = await ctx.params;
  const url = new URL(request.url);

  // The state is the only trustworthy record of where this started, so it is
  // read before anything else — including before reporting an error, which has
  // to travel back to the app rather than to a web page.
  const state = await verifyState(url.searchParams.get("state"));
  const mode = state?.mode ?? "web";
  const returnTo = state?.returnTo ?? "/dashboard";

  try {
    if (!isOAuthProvider(raw)) throw new ApiError(404, "Unknown sign-in provider.");
    if (!state || state.provider !== raw) {
      throw new ApiError(
        400,
        "This sign-in link has expired. Please try again.",
      );
    }

    const errorCode = url.searchParams.get("error");
    if (errorCode) {
      throw providerError(errorCode, url.searchParams.get("error_description"));
    }

    const code = url.searchParams.get("code");
    if (!code) throw new ApiError(400, "The provider did not return a code.");

    const { codeVerifier } = await consumeTransaction(state.nonce);
    const provider = resolveProvider(raw);

    const accessToken = await exchangeCode(provider, {
      code,
      redirectUri: redirectUri(raw, request),
      codeVerifier,
    });
    const profile = await fetchProfile(provider, accessToken);
    const user = await resolveUser(raw, profile);

    const session = { userId: user.id, role: user.role } as const;
    // Only the web leg wants a cookie. The native leg runs in the user's own
    // browser, which has no business keeping a TaskFlow session afterwards.
    const token =
      mode === "web"
        ? await createSessionCookie(session, true)
        : await signSession(session);

    return oauthSuccess({ mode, returnTo, token });
  } catch (error) {
    return oauthFailure(error, { mode, returnTo });
  }
}

/**
 * Finds or creates the TaskFlow account behind a provider profile.
 *
 * Matching is by the provider's subject id first and verified email second, so
 * signing in with Google and then with Microsoft on the same address lands on
 * one account rather than two. An *unverified* email is never allowed to reach
 * an existing account — that is account takeover with extra steps.
 */
async function resolveUser(id: OAuthProviderId, profile: OAuthProfile) {
  const provider = providerDbValue(id);

  const linked = await db.oAuthAccount.findUnique({
    where: {
      provider_providerAccountId: {
        provider,
        providerAccountId: profile.providerAccountId,
      },
    },
    include: { user: true },
  });

  if (linked) {
    await db.oAuthAccount.update({
      where: { id: linked.id },
      data: { lastUsedAt: new Date(), email: profile.email },
    });
    return assertUsable(linked.user);
  }

  if (!profile.email) {
    throw new ApiError(
      400,
      "That account has no email address attached, so it cannot be used to sign in.",
    );
  }
  if (!profile.emailVerified) {
    throw new ApiError(
      400,
      "Your email address is not verified with that provider. Verify it and try again.",
    );
  }

  const existing = await db.user.findUnique({ where: { email: profile.email } });

  if (existing) {
    await db.oAuthAccount.create({
      data: {
        userId: existing.id,
        provider,
        providerAccountId: profile.providerAccountId,
        email: profile.email,
      },
    });
    // Only fill gaps — a picture the user chose here outranks the provider's.
    if (!existing.avatarUrl && profile.avatarUrl) {
      return assertUsable(
        await db.user.update({
          where: { id: existing.id },
          data: { avatarUrl: profile.avatarUrl },
        }),
      );
    }
    return assertUsable(existing);
  }

  // A brand-new account: no password, no mobile number. Both are nullable, and
  // the profile screen is where the user fills the number in if they want one.
  const created = await db.user.create({
    data: {
      fullName: profile.fullName || profile.email.split("@")[0],
      email: profile.email,
      avatarUrl: profile.avatarUrl,
      role: "USER",
      status: "ACTIVE",
      oauthAccounts: {
        create: {
          provider,
          providerAccountId: profile.providerAccountId,
          email: profile.email,
        },
      },
    },
  });

  return assertUsable(created);
}

function assertUsable<T extends { id: string; status: string; role: string }>(
  user: T,
) {
  if (user.status === "DISABLED") {
    throw new ApiError(
      403,
      "Your account has been disabled. Please contact an administrator.",
    );
  }
  return {
    ...user,
    role: user.role === "ADMIN" ? ("ADMIN" as const) : ("USER" as const),
  };
}
