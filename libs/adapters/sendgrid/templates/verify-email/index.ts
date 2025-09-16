import type { VerifyEmailTemplate } from "./types";
import { ENV } from "@env-utils";
import { EmailTemplateEnum } from "@email-entity";

export const buildVerifyEmailTemplate = ({
  customerFirstName,
  newEmailAddress,
  expiryMinutes,
  emailChangeCode,
}: {
  customerFirstName: string;
  newEmailAddress: string;
  expiryMinutes: number;
  emailChangeCode: string;
}): VerifyEmailTemplate => {
  return {
    id: EmailTemplateEnum.VERIFY_EMAIL,
    templateData: {
      brand_logo_url: `${ENV.IMAGES_HOST}/logo.png`,
      brand_name: ENV.BREVO_NAME,
      customer_first_name: customerFirstName,
      new_email_address: newEmailAddress,
      expiry_minutes: expiryMinutes,
      email_change_code: emailChangeCode,
      support_email: `info@${ENV.BREVO_DOMAIN}`,
      brand_address: "Portugal",
    },
  };
};
