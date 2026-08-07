import { db } from "@/lib/db";
import { badRequest, handler, ok, parseBody, requireUser } from "@/lib/api";
import { hashPassword, verifyPassword } from "@/lib/password";
import { changePasswordSchema } from "@/lib/validation";

export const POST = handler(async (request: Request) => {
  const user = await requireUser();
  const input = await parseBody(request, changePasswordSchema);

  // A social-only account is setting its first password, and has nothing to
  // confirm against — being signed in is the proof of ownership.
  if (user.passwordHash) {
    if (!input.currentPassword) {
      throw badRequest("Enter your current password.", {
        currentPassword: ["Enter your current password."],
      });
    }
    const matches = await verifyPassword(
      input.currentPassword,
      user.passwordHash,
    );
    if (!matches) {
      throw badRequest("Your current password is incorrect.", {
        currentPassword: ["Your current password is incorrect."],
      });
    }
  }

  await db.user.update({
    where: { id: user.id },
    data: { passwordHash: await hashPassword(input.newPassword) },
  });

  return ok({ success: true });
});
