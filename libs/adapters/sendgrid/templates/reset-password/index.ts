import type { ResetPasswordTemplate } from "./types";
import { ENV } from "@env-utils";
import { EmailTemplateEnum } from "@email-entity";

export const buildResetPasswordTemplate = ({
  customerFirstName,
  expiryMinutes,
  resetCode,
  resetUrl,
}: {
  customerFirstName: string;
  expiryMinutes: number;
  resetCode: string;
  resetUrl: string;
}): ResetPasswordTemplate => {
  return {
    id: EmailTemplateEnum.RESET_PASSWORD,
    templateData: {
      brand_logo_url: `${ENV.IMAGES_HOST}/logo.png`,
      brand_name: ENV.BREVO_NAME,
      customer_first_name: customerFirstName,
      expiry_minutes: expiryMinutes,
      reset_code: resetCode,
      reset_url: resetUrl,
      support_email: `info@${ENV.BREVO_DOMAIN}`,
      brand_address: `Portugal`,
    },
  };
};
