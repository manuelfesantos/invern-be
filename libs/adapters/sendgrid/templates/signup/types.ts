import type { Template } from "../types";

type SignupTemplateData = {
  brand_name: string;
  brand_logo_url: string;
  customer_first_name: string;
  expiry_minutes: number;
  verification_code: string;
  verify_url: string;
  support_email: string;
  brand_address: string;
};

export type SignupTemplate = Template<SignupTemplateData>;
