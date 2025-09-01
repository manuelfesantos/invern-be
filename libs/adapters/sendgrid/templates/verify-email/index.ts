import type { VerifyEmailTemplate } from "./types";
import { ENV } from "@env-utils";

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
    id: "d-97948d4bcfa745ac97ab63ec9c8a62c2",
    from: `info@${ENV.SENDGRID_DOMAIN}`,
    fromName: ENV.SENDGRID_NAME,
    templateData: {
      brand_logo_url: `${ENV.IMAGES_HOST}/logo.png`,
      brand_name: ENV.SENDGRID_NAME,
      customer_first_name: customerFirstName,
      new_email_address: newEmailAddress,
      expiry_minutes: expiryMinutes,
      email_change_code: emailChangeCode,
      support_email: `info@${ENV.SENDGRID_DOMAIN}`,
      brand_address: "Portugal",
    },
  };
};
