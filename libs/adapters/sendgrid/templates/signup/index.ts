import type { SignupTemplate } from "./types";
import { EmailTemplateEnum } from "@email-entity";

export const buildSignupTemplate = ({
  brandName,
  brandLogoUrl,
  customerFirstName,
  expiryMinutes,
  verificationCode,
  verifyUrl,
  supportEmail,
  brandAddress,
}: {
  brandName: string;
  brandLogoUrl: string;
  customerFirstName: string;
  expiryMinutes: number;
  verificationCode: string;
  verifyUrl: string;
  supportEmail: string;
  brandAddress: string;
}): SignupTemplate => {
  return {
    id: EmailTemplateEnum.SIGNUP_SUCCESSFUL,
    templateData: {
      brand_name: brandName,
      brand_logo_url: brandLogoUrl,
      customer_first_name: customerFirstName,
      expiry_minutes: expiryMinutes,
      verification_code: verificationCode,
      verify_url: verifyUrl,
      support_email: supportEmail,
      brand_address: brandAddress,
    },
  };
};
