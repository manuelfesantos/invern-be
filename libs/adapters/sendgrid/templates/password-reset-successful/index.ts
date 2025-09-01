import type { PasswordResetSuccessfulTemplate } from "./types";
import { ENV } from "@env-utils";

export const buildPasswordResetSuccessfulTemplate = ({
  customerFirstName,
  loginUrl,
}: {
  customerFirstName: string;
  loginUrl: string;
}): PasswordResetSuccessfulTemplate => {
  return {
    id: "d-8f647036eac84597b82e73ce20011592",
    from: `info@${ENV.SENDGRID_DOMAIN}`,
    fromName: ENV.SENDGRID_NAME,
    templateData: {
      brand_address: "Portugal",
      brand_logo_url: `${ENV.IMAGES_HOST}/logo.png`,
      brand_name: ENV.SENDGRID_NAME,
      customer_first_name: customerFirstName,
      login_url: loginUrl,
      support_email: `info@${ENV.SENDGRID_DOMAIN}`,
    },
  };
};
