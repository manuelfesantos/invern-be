import { Template } from "../types";

type VerifyEmailTemplateData = {
  brand_logo_url: string;
  brand_name: string;
  customer_first_name: string;
  new_email_address: string;
  expiry_minutes: number;
  email_change_code: string;
  support_email: string;
  brand_address: string;
};

export type VerifyEmailTemplate = Template<VerifyEmailTemplateData>;
