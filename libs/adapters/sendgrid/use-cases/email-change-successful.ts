import { buildEmailChangeSuccessfulTemplate } from "../templates";
import { sendEmail } from "../send-email";
import type { User } from "@user-entity";

export const sendEmailChangeSuccessfulEmail = async (
  user: User,
  newEmailAddress: string,
  manageAccountUrl: string,
): Promise<Response> => {
  return sendEmail({
    to: newEmailAddress,
    template: buildEmailChangeSuccessfulTemplate({
      customerFirstName: user.firstName,
      newEmailAddress: newEmailAddress,
      manageAccountUrl,
    }),
  });
};
