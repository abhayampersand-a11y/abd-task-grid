import "server-only";

import { badRequest } from "./api";

/** Only formats every browser and both mobile platforms render natively. */
const ALLOWED = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
]);

/**
 * Generous for a picture the client already downscales, but small enough that
 * the request stays under the 4.5 MB body limit of a Vercel function.
 */
const MAX_BYTES = 4 * 1024 * 1024;

export interface UploadedImage {
  bytes: Uint8Array;
  contentType: string;
  /** File extension matching `contentType`, for the storage key. */
  extension: string;
}

/**
 * Pulls the single `file` field out of a multipart request and checks it is a
 * picture we are willing to store. Shared by every picture upload — profile
 * photos and group icons — so one allow-list and one size ceiling govern all
 * of them, and the messages a user sees do not drift apart between screens.
 *
 * `subject` names the thing being uploaded so the errors read naturally
 * ("Group icons must be…" rather than a generic "The image must be…").
 */
export async function readImageUpload(
  request: Request,
  subject: string,
): Promise<UploadedImage> {
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    throw badRequest("Upload the image as multipart form data.");
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    throw badRequest("No image was attached.");
  }

  const extension = ALLOWED.get(file.type);
  if (!extension) {
    throw badRequest(`${subject} must be a JPEG, PNG or WebP image.`);
  }
  if (file.size === 0) throw badRequest("That image file is empty.");
  if (file.size > MAX_BYTES) {
    throw badRequest(`${subject} must be smaller than 4 MB.`);
  }

  return {
    bytes: new Uint8Array(await file.arrayBuffer()),
    contentType: file.type,
    extension,
  };
}
