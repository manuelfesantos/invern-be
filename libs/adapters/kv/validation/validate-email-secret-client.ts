import {
  ValidateEmailSecretBody,
  validateEmailSecretBodySchema,
} from "@user-entity";
import {
  deleteBaseValidationSecret,
  setBaseValidationSecret,
  getBaseValidationSecret,
} from "./base-validation-secret-client";

export const getValidateEmailSecret = async (
  key: string,
): Promise<ValidateEmailSecretBody | null> => {
  return await getBaseValidationSecret(key, validateEmailSecretBodySchema);
};

export const setValidateEmailSecret = async (
  key: string,
  value: ValidateEmailSecretBody,
): Promise<void> => {
  await setBaseValidationSecret(key, value);
};

export const deleteValidateEmailSecret = async (key: string): Promise<void> => {
  await deleteBaseValidationSecret(key);
};
