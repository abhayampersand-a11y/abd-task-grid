import { db } from "@/lib/db";
import { badRequest, handler, ok, parseBody, requireUser } from "@/lib/api";
import { hashPassword, verifyPassword } from "@/lib/password";
import { changePasswordSchema } from "@/lib/validation";

export const POST = handler(async (request: Request) => {
  const user = await requireUser();
  const input = await parseBody(request, changePasswordSchema);

  const matches = await verifyPassword(input.currentPassword, user.passwordHash);
  if (!matches) {
    throw badRequest("Your current password is incorrect.", {
      currentPassword: ["Your current password is incorrect."],
    });
  }

  await db.user.update({
    where: { id: user.id },
    data: { passwordHash: await hashPassword(input.newPassword) },
  });

  return ok({ success: true });
});
