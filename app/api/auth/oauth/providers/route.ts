import { handler, ok } from "@/lib/api";
import { configuredProviders } from "@/lib/oauth-config";

/**
 * Which social buttons are worth rendering.
 *
 * The Expo app cannot see this server's environment, so without this it would
 * have to show all three and let the user discover the missing credentials by
 * hitting a 503 mid-flow.
 */
export const GET = handler(async () => ok({ providers: configuredProviders() }));
