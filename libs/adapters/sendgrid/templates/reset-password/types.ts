import { Template } from "../types";

type ResetPasswordTemplateData = {
  brand_logo_url: string;
  brand_name: string;
  customer_first_name: string;
  expiry_minutes: number;
  reset_code: string;
  reset_url: string;
  support_email: string;
  brand_address: string;
};

export type ResetPasswordTemplate = Template<ResetPasswordTemplateData>;
