import type { Template } from "../types";

type EmailChangeSuccessfulTemplateData = {
  brand_logo_url: string;
  brand_name: string;
  customer_first_name: string;
  new_email_address: string;
  support_email: string;
  manage_account_url: string;
  brand_address: string;
};

export type EmailChangeSuccessfulTemplate =
  Template<EmailChangeSuccessfulTemplateData>;
