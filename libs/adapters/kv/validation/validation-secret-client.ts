import {
  BaseValidationSecretBody,
  baseValidationSecretBodySchema,
} from "@user-entity";
import {
  deleteBaseValidationSecret,
  getBaseValidationSecret,
  setBaseValidationSecret,
} from "./base-validation-secret-client";

export const getValidationSecret = async (
  key: string,
): Promise<BaseValidationSecretBody | null> => {
  return await getBaseValidationSecret(key, baseValidationSecretBodySchema);
};

export const setValidationSecret = async (
  key: string,
  value: BaseValidationSecretBody,
): Promise<void> => {
  await setBaseValidationSecret(key, value);
};

export const deleteValidationSecret = async (key: string): Promise<void> => {
  await deleteBaseValidationSecret(key);
};
