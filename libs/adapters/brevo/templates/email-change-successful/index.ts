import type { EmailChangeSuccessfulTemplate } from "./types";
import { ENV } from "@env-utils";
import { EmailTemplateEnum } from "@email-entity";

export const buildEmailChangeSuccessfulTemplate = ({
  customerFirstName,
  newEmailAddress,
  manageAccountUrl,
}: {
  customerFirstName: string;
  newEmailAddress: string;
  manageAccountUrl: string;
}): EmailChangeSuccessfulTemplate => ({
  id: EmailTemplateEnum.EMAIL_CHANGED_SUCCESSFULLY,
  templateData: {
    brand_logo_url: `${ENV.IMAGES_HOST}/logo.png`,
    brand_name: ENV.BREVO_NAME,
    brand_address: "Portugal",
    support_email: `info@${ENV.BREVO_DOMAIN}`,
    customer_first_name: customerFirstName,
    manage_account_url: manageAccountUrl,
    new_email_address: newEmailAddress,
  },
});
