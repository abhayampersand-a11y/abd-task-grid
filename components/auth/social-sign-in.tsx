import {
  configuredProviders,
  providerLabel,
  type OAuthProviderId,
} from "@/lib/oauth-config";

/**
 * The "or continue with" row.
 *
 * Plain anchors, not buttons: the whole flow is a top-level navigation to
 * `/api/auth/oauth/{provider}/start`, so there is nothing for JavaScript to do
 * and this stays a server component that can read which providers actually
 * have credentials configured.
 */
export function SocialSignIn({
  next,
  label = "Or continue with",
}: {
  next?: string;
  label?: string;
}) {
  const providers = configuredProviders();
  if (providers.length === 0) return null;

  const query = next ? `?next=${encodeURIComponent(next)}` : "";

  return (
    <>
      <div className="mt-7 flex items-center gap-4">
        <span className="h-px flex-1 bg-line" />
        <span className="text-[12.5px] text-ink-faint">{label}</span>
        <span className="h-px flex-1 bg-line" />
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        {providers.map((provider) => (
          <a
            key={provider}
            href={`/api/auth/oauth/${provider}/start${query}`}
            className="flex h-11 items-center justify-center gap-2 rounded-xl border border-line bg-surface text-sm font-medium text-ink-soft transition-colors hover:border-line-strong hover:bg-surface-muted"
          >
            <ProviderMark provider={provider} />
            {providerLabel(provider)}
          </a>
        ))}
      </div>
    </>
  );
}

/** Official brand marks — lucide dropped its logo set, so these are inline. */
function ProviderMark({ provider }: { provider: OAuthProviderId }) {
  if (provider === "google") {
    return (
      <svg viewBox="0 0 48 48" aria-hidden className="size-[18px]">
        <path
          fill="#FFC107"
          d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
        />
        <path
          fill="#FF3D00"
          d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"
        />
        <path
          fill="#4CAF50"
          d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"
        />
        <path
          fill="#1976D2"
          d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"
        />
      </svg>
    );
  }

  if (provider === "microsoft") {
    return (
      <svg viewBox="0 0 23 23" aria-hidden className="size-[16px]">
        <rect x="1" y="1" width="10" height="10" fill="#F25022" />
        <rect x="12" y="1" width="10" height="10" fill="#7FBA00" />
        <rect x="1" y="12" width="10" height="10" fill="#00A4EF" />
        <rect x="12" y="12" width="10" height="10" fill="#FFB900" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden className="size-[17px]" fill="#0A66C2">
      <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.63-1.85 3.36-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.72V1.72C24 .77 23.2 0 22.22 0z" />
    </svg>
  );
}
