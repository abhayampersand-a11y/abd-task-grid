import "server-only";

import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "./db";
import { readSession } from "./session";

/** Zod's `flattenError` yields optional arrays; mirror that here. */
export type FieldErrorMap = Record<string, string[] | undefined>;

export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
    readonly fieldErrors?: FieldErrorMap,
  ) {
    super(message);
  }
}

export const unauthorized = (m = "You must be signed in.") =>
  new ApiError(401, m);
export const forbidden = (m = "You do not have access to this resource.") =>
  new ApiError(403, m);
export const notFound = (m = "Not found.") => new ApiError(404, m);
export const badRequest = (m: string, fields?: FieldErrorMap) =>
  new ApiError(400, m, fields);

/**
 * Wraps a route handler so thrown ApiErrors (and anything else) become
 * consistent JSON responses instead of 500s with stack traces.
 */
export function handler<Args extends unknown[]>(
  fn: (...args: Args) => Promise<NextResponse | Response>,
) {
  return async (...args: Args): Promise<NextResponse | Response> => {
    try {
      return await fn(...args);
    } catch (error) {
      if (error instanceof ApiError) {
        return NextResponse.json(
          { message: error.message, fieldErrors: error.fieldErrors },
          { status: error.status },
        );
      }
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          {
            message: "Please check the highlighted fields.",
            fieldErrors: z.flattenError(error).fieldErrors,
          },
          { status: 400 },
        );
      }
      // Unexpected failures (driver errors, connection problems) can carry
      // connection strings and SQL in their message — never ship that to the
      // client. The full error still goes to the server log.
      console.error("[api]", error);
      const message =
        process.env.NODE_ENV === "production"
          ? "Something went wrong. Please try again."
          : error instanceof Error
            ? error.message
            : "Something went wrong.";
      return NextResponse.json({ message }, { status: 500 });
    }
  };
}

/** Reads and validates a JSON body against a Zod schema. */
export async function parseBody<S extends z.ZodType>(
  request: Request,
  schema: S,
): Promise<z.output<S>> {
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    throw badRequest("Request body must be valid JSON.");
  }
  const result = schema.safeParse(raw);
  if (!result.success) {
    throw badRequest(
      "Please check the highlighted fields.",
      z.flattenError(result.error).fieldErrors,
    );
  }
  return result.data;
}

/** The signed-in user, guaranteed active. Throws 401/403 otherwise. */
export async function requireUser() {
  const session = await readSession();
  if (!session) throw unauthorized();

  const user = await db.user.findUnique({ where: { id: session.userId } });
  if (!user) throw unauthorized("Your session is no longer valid.");
  if (user.status === "DISABLED") {
    throw forbidden("Your account has been disabled by an administrator.");
  }
  return user;
}

export async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== "ADMIN") throw forbidden("Administrator access required.");
  return user;
}

/** Confirms the user belongs to the group and returns their membership. */
export async function requireMembership(groupId: string, userId: string) {
  const membership = await db.groupMember.findUnique({
    where: { groupId_userId: { groupId, userId } },
  });
  if (!membership) throw forbidden("You are not a member of this group.");
  return membership;
}

export const ok = <T>(data: T, status = 200) =>
  NextResponse.json(data, { status });
