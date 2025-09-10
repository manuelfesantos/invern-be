import type {
  ValidateEmailSecretBody,
  ValidateNewEmailSecretBody,
} from "@user-entity";
import { validateNewEmailSecretBodySchema } from "@user-entity";
import { validateEmailSecretBodySchema } from "@user-entity";
import {
  deleteBaseValidationSecret,
  setBaseValidationSecret,
  getBaseValidationSecret,
} from "./base-validation-secret-client";

export const getValidateNewEmailSecret = async (
  key: string,
): Promise<ValidateNewEmailSecretBody | null> => {
  return await getBaseValidationSecret(key, validateNewEmailSecretBodySchema);
};

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
