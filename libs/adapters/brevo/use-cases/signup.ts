import type { User } from "@user-entity";
import { sendEmail } from "../send-email";
import { buildSignupTemplate } from "../templates";
import { ENV } from "@env-utils";

export const sendSignupEmail = async (
  user: User,
  validationCode: string,
  expiryMinutes: number,
  verifyUrl: string,
): Promise<Response> => {
  return sendEmail({
    to: user.email,
    template: buildSignupTemplate({
      customerFirstName: user.firstName,
      verificationCode: validationCode,
      expiryMinutes,
      brandLogoUrl: `${ENV.IMAGES_HOST}/logo.png`,
      supportEmail: `info@${ENV.BREVO_DOMAIN}`,
      brandName: ENV.BREVO_NAME,
      brandAddress: `Portugal`,
      verifyUrl,
    }),
  });
};
