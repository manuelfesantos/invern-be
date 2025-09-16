import type { PasswordResetSuccessfulTemplate } from "./types";
import { ENV } from "@env-utils";
import { EmailTemplateEnum } from "@email-entity";

export const buildPasswordResetSuccessfulTemplate = ({
  customerFirstName,
  loginUrl,
}: {
  customerFirstName: string;
  loginUrl: string;
}): PasswordResetSuccessfulTemplate => {
  return {
    id: EmailTemplateEnum.PASSWORD_RESET_SUCCESSFUL,
    templateData: {
      brand_address: "Portugal",
      brand_logo_url: `${ENV.IMAGES_HOST}/logo.png`,
      brand_name: ENV.BREVO_NAME,
      customer_first_name: customerFirstName,
      login_url: loginUrl,
      support_email: `info@${ENV.BREVO_DOMAIN}`,
    },
  };
};
