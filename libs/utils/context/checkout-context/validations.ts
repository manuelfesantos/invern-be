import { contextStore } from "@context-utils";
import { decrypt, decryptObjectString } from "@crypto-utils";
import { addressSchema } from "@address-entity";
import { userDetailsSchema } from "@user-entity";
import {
  CheckoutStageEnum,
  CheckoutStageEnumType,
} from "@checkout-session-entity";
import { uuidSchema } from "@global-entity";

const isAddressValid = async (): Promise<boolean> => {
  const { address: addressString } = contextStore.context;
  if (!addressString) return false;
  const address = await decryptObjectString(addressString);
  return addressSchema.safeParse(address).success;
};

const isUserDetailsValid = async (): Promise<boolean> => {
  const { userDetails: userDetailsString, userId } = contextStore.context;
  if (userId) return true;
  if (!userDetailsString) return false;
  const userDetails = await decryptObjectString(userDetailsString);
  return userDetailsSchema.safeParse(userDetails).success;
};

const isShippingMethodValid = async (): Promise<boolean> => {
  const { shippingMethodId } = contextStore.context;
  if (!shippingMethodId) return false;
  const shippingMethod = await decrypt(shippingMethodId);
  return uuidSchema("").safeParse(shippingMethod).success;
};

const isReviewValid = async (): Promise<boolean> => {
  return true;
};

export const validations: Record<
  CheckoutStageEnumType,
  () => Promise<boolean>
> = {
  [CheckoutStageEnum.ADDRESS]: isAddressValid,
  [CheckoutStageEnum.PERSONAL_DETAILS]: isUserDetailsValid,
  [CheckoutStageEnum.SHIPPING]: isShippingMethodValid,
  [CheckoutStageEnum.REVIEW]: isReviewValid,
};
