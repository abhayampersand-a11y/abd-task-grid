import "server-only";

/**
 * A tiny in-process cache for answers that are expensive to compute and cheap
 * to be slightly stale.
 *
 * The entry holds the *promise*, not the resolved value, which is the whole
 * point: when fifty requests arrive for a cold key at once, forty-nine of them
 * wait on the one query the first request already started instead of piling
 * fifty identical scans onto the database.
 *
 * It lives in the process, so each server instance keeps its own copy and a
 * deploy clears it. Only use it where a stale read for `ttlMs` is harmless —
 * dashboard totals, not anything a user just changed and expects to see.
 */
interface Entry<T> {
  value: Promise<T>;
  expiresAt: number;
}

const store = new Map<string, Entry<unknown>>();

export function cached<T>(
  key: string,
  ttlMs: number,
  load: () => Promise<T>,
): Promise<T> {
  const now = Date.now();
  const hit = store.get(key) as Entry<T> | undefined;
  if (hit && hit.expiresAt > now) return hit.value;

  // A failed load must not be cached, or one blip poisons the key for `ttlMs`.
  const value = load().catch((error: unknown) => {
    store.delete(key);
    throw error;
  });

  store.set(key, { value, expiresAt: now + ttlMs });
  return value;
}

/** Drops one key, or the whole cache when called with no key. */
export function invalidate(key?: string) {
  if (key === undefined) store.clear();
  else store.delete(key);
}
