import "server-only";

import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { badRequest } from "./api";

/**
 * Cloudflare R2 is S3-compatible, so the AWS SDK talks to it unchanged — the
 * only differences are the endpoint (account-scoped, not region-scoped) and
 * the region string, which R2 ignores but the signer still demands.
 *
 * Nothing here throws at import time. The app has to keep booting on a machine
 * with no R2 credentials (a fresh clone, a preview branch); only an actual
 * upload should fail, and it should say why.
 */

const ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const BUCKET = process.env.R2_BUCKET;
/** Public origin the bucket is served from — r2.dev URL or a custom domain. */
const PUBLIC_URL = process.env.R2_PUBLIC_URL?.replace(/\/+$/, "");

export const isStorageConfigured = Boolean(
  ACCOUNT_ID && ACCESS_KEY_ID && SECRET_ACCESS_KEY && BUCKET && PUBLIC_URL,
);

let client: S3Client | null = null;

function storage() {
  if (!isStorageConfigured) {
    throw badRequest(
      "File storage is not configured on this server. Set the R2_* environment variables.",
    );
  }
  client ??= new S3Client({
    region: "auto",
    endpoint: `https://${ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: ACCESS_KEY_ID!,
      secretAccessKey: SECRET_ACCESS_KEY!,
    },
  });
  return client;
}

/** The browser-facing URL for a stored object. */
export function publicUrlFor(key: string) {
  return `${PUBLIC_URL}/${key}`;
}

/**
 * The inverse of `publicUrlFor`, for the rows that store a URL but no key —
 * task attachments. Returns null for anything that is not served from our own
 * bucket (an OAuth provider's photo, a pasted link), which must never be
 * deleted on our say-so.
 */
export function keyFromPublicUrl(url: string | null | undefined) {
  const prefix = PUBLIC_URL ? `${PUBLIC_URL}/` : null;
  if (!url || !prefix || !url.startsWith(prefix)) return null;
  return url.slice(prefix.length) || null;
}

export async function putObject(
  key: string,
  body: Uint8Array,
  contentType: string,
) {
  await storage().send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: body,
      ContentType: contentType,
      // Every upload gets a fresh key, so an object is never replaced in
      // place — it is safe to let the CDN and the client hold it forever.
      CacheControl: "public, max-age=31536000, immutable",
    }),
  );
  return publicUrlFor(key);
}

/**
 * Best-effort delete. Callers use this to reclaim the *previous* avatar after
 * the new one is already saved, so a failure here must never surface as a
 * failed upload — it leaves one orphaned object and logs it.
 */
export async function deleteObjectQuietly(key: string | null | undefined) {
  if (!key || !isStorageConfigured) return;
  try {
    await storage().send(
      new DeleteObjectCommand({ Bucket: BUCKET, Key: key }),
    );
  } catch (error) {
    console.error("[r2] failed to delete", key, error);
  }
}
