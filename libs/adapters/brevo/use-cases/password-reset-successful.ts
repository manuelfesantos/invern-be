import type { User } from "@user-entity";
import { sendEmail } from "../send-email";
import { buildPasswordResetSuccessfulTemplate } from "../templates";

export const sendPasswordResetSuccessfulEmail = async (
  user: User,
  loginUrl: string,
): Promise<Response> => {
  return sendEmail({
    template: buildPasswordResetSuccessfulTemplate({
      loginUrl,
      customerFirstName: user.firstName,
    }),
    to: user.email,
  });
};
