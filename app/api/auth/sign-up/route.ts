import { db } from "@/lib/db";
import { badRequest, handler, ok, parseBody } from "@/lib/api";
import { hashPassword } from "@/lib/password";
import { createSessionCookie } from "@/lib/session";
import { toCurrentUser } from "@/lib/serialize";
import { signUpSchema } from "@/lib/validation";

export const POST = handler(async (request: Request) => {
  const input = await parseBody(request, signUpSchema);
  const normalisedMobile = input.mobile.replace(/\s+/g, " ").trim();

  const existing = await db.user.findFirst({
    where: {
      OR: [{ email: input.email }, { mobile: normalisedMobile }],
    },
    select: { email: true, mobile: true },
  });

  if (existing) {
    throw badRequest("An account with those details already exists.", {
      ...(existing.email === input.email
        ? { email: ["This email is already registered."] }
        : {}),
      ...(existing.mobile === normalisedMobile
        ? { mobile: ["This mobile number is already registered."] }
        : {}),
    });
  }

  const user = await db.user.create({
    data: {
      fullName: input.fullName,
      email: input.email,
      mobile: normalisedMobile,
      passwordHash: await hashPassword(input.password),
      role: "USER",
      status: "ACTIVE",
    },
  });

  const token = await createSessionCookie({ userId: user.id, role: "USER" });

  return ok({ user: toCurrentUser(user), token }, 201);
});
