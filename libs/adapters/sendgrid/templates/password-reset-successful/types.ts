import { Template } from "../types";

type PasswordResetSuccessfulTemplateData = {
  brand_logo_url: string;
  brand_name: string;
  customer_first_name: string;
  login_url: string;
  support_email: string;
  brand_address: string;
};

export type PasswordResetSuccessfulTemplate =
  Template<PasswordResetSuccessfulTemplateData>;
