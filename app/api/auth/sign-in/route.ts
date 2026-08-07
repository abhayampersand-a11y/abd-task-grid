import { db } from "@/lib/db";
import { ApiError, handler, ok, parseBody } from "@/lib/api";
import { verifyPassword } from "@/lib/password";
import { createSessionCookie } from "@/lib/session";
import { toCurrentUser } from "@/lib/serialize";
import { signInSchema } from "@/lib/validation";

export const POST = handler(async (request: Request) => {
  const { identifier, password, remember } = await parseBody(
    request,
    signInSchema,
  );

  const isEmail = identifier.includes("@");
  const user = await db.user.findFirst({
    where: isEmail
      ? { email: identifier.toLowerCase() }
      : { mobile: identifier },
  });

  // Same message either way so the form can't be used to enumerate accounts.
  // A social-only account has no hash, and lands here too rather than leaking
  // that the address exists under a different sign-in method.
  const invalid = new ApiError(401, "Incorrect email/mobile or password.");
  if (!user || !user.passwordHash) throw invalid;
  if (!(await verifyPassword(password, user.passwordHash))) throw invalid;

  if (user.status === "DISABLED") {
    throw new ApiError(
      403,
      "Your account has been disabled. Please contact an administrator.",
    );
  }

  const token = await createSessionCookie(
    { userId: user.id, role: user.role === "ADMIN" ? "ADMIN" : "USER" },
    remember,
  );

  // `token` is for native clients only; the web app ignores it and relies on
  // the httpOnly cookie set above.
  return ok({ user: toCurrentUser(user), token });
});
