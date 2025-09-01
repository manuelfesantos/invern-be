import { buildResetPasswordTemplate } from "../templates";
import { sendEmail } from "../send-email";
import type { User } from "@user-entity";

export const sendResetPasswordEmail = async (
  user: User,
  resetCode: string,
  resetUrl: string,
  expiryMinutes: number,
): Promise<Response> => {
  const template = buildResetPasswordTemplate({
    customerFirstName: user.firstName,
    resetCode: resetCode,
    resetUrl: resetUrl,
    expiryMinutes,
  });

  return sendEmail({
    to: user.email,
    template,
  });
};
