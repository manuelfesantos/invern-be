import type { User } from "@user-entity";
import queryString from "query-string";
import { sendSignupEmail as sendSignupEmailAdapter } from "@brevo-adapter";
import { contextStore } from "@context-utils";
import { SECRET_EXPIRY_MINUTES } from "./values";
import { ENV } from "@env-utils";

export const sendSignupEmail = async (
  user: User,
  validationCode: string,
): Promise<void> => {
  const { country } = contextStore.context;
  const queryParams = queryString.stringify({
    email: user.email,
    code: validationCode,
  });

  await sendSignupEmailAdapter(
    user,
    validationCode,
    SECRET_EXPIRY_MINUTES,
    `${ENV.FRONTEND_HOST}/${country.code.toLowerCase()}/sign-up/verify-email?${queryParams}`,
  );
};
