import type { SignupTemplate } from "./types";
import { ENV } from "@env-utils";

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
    id: "d-310c0a520dcd4bbbbe88f9342fe021a4",
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
    from: `info@${ENV.SENDGRID_DOMAIN}`,
    fromName: ENV.SENDGRID_NAME,
  };
};
