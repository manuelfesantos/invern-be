import { ResetPasswordTemplate } from "./types";
import { ENV } from "@env-utils";

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
    id: "d-ec531d5a2be4423ea8372e64e06bc6ef",
    from: `info@${ENV.SENDGRID_DOMAIN}`,
    fromName: ENV.SENDGRID_NAME,
    templateData: {
      brand_logo_url: `${ENV.IMAGES_HOST}/logo.png`,
      brand_name: ENV.SENDGRID_NAME,
      customer_first_name: customerFirstName,
      expiry_minutes: expiryMinutes,
      reset_code: resetCode,
      reset_url: resetUrl,
      support_email: `info@${ENV.SENDGRID_DOMAIN}`,
      brand_address: `Portugal`,
    },
  };
};
