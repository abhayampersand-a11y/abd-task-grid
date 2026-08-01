import { z } from "zod";

export type FieldErrors = Record<string, string | undefined>;

/**
 * Client-side mirror of the server validation. Returns the first message per
 * field so forms and the API stay in agreement about what "valid" means.
 */
export function validate<S extends z.ZodType>(
  schema: S,
  values: unknown,
): { ok: true; data: z.output<S> } | { ok: false; errors: FieldErrors } {
  const result = schema.safeParse(values);
  if (result.success) return { ok: true, data: result.data };

  const flattened = z.flattenError(result.error);
  const fieldErrors = flattened.fieldErrors as Record<
    string,
    string[] | undefined
  >;
  const errors: FieldErrors = {};

  for (const [field, messages] of Object.entries(fieldErrors)) {
    if (messages?.length) errors[field] = messages[0];
  }
  if (flattened.formErrors.length && !Object.keys(errors).length) {
    errors._form = flattened.formErrors[0];
  }

  return { ok: false, errors };
}

/** Turns the API's `fieldErrors` payload into the same flat shape. */
export function fromApiFieldErrors(
  fieldErrors: Record<string, string[] | undefined> | undefined,
): FieldErrors {
  if (!fieldErrors) return {};
  return Object.fromEntries(
    Object.entries(fieldErrors)
      .filter(([, messages]) => messages?.length)
      .map(([field, messages]) => [field, messages![0]]),
  );
}
