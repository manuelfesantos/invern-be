import { EmailChangeSuccessfulTemplate } from "./types";
import { ENV } from "@env-utils";

export const buildEmailChangeSuccessfulTemplate = ({
  customerFirstName,
  newEmailAddress,
  manageAccountUrl,
}: {
  customerFirstName: string;
  newEmailAddress: string;
  manageAccountUrl: string;
}): EmailChangeSuccessfulTemplate => ({
  from: `info@${ENV.SENDGRID_DOMAIN}`,
  fromName: ENV.SENDGRID_NAME,
  id: "d-222b39e8fdbe4000882180e63577ba46",
  templateData: {
    brand_logo_url: `${ENV.IMAGES_HOST}/logo.png`,
    brand_name: ENV.SENDGRID_NAME,
    brand_address: "Portugal",
    support_email: `info@${ENV.SENDGRID_DOMAIN}`,
    customer_first_name: customerFirstName,
    manage_account_url: manageAccountUrl,
    new_email_address: newEmailAddress,
  },
});
