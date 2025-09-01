import type { User } from "@user-entity";
import { sendEmail } from "../send-email";
import { buildVerifyEmailTemplate } from "../templates";

export const sendVerifyEmail = async (
  user: User,
  validationCode: string,
  expiryMinutes: number,
  newEmailAddress: string,
): Promise<Response> => {
  return sendEmail({
    to: newEmailAddress,
    template: buildVerifyEmailTemplate({
      emailChangeCode: validationCode,
      expiryMinutes,
      customerFirstName: user.firstName,
      newEmailAddress: newEmailAddress,
    }),
  });
};
