import { contextStore } from "@context-utils";
import { decrypt, decryptObjectString } from "@crypto-utils";
import { Address, addressSchema } from "@address-entity";
import { userDetailsSchema } from "@user-entity";
import {
  CheckoutStageNameEnum,
  CheckoutStageName,
} from "@checkout-session-entity";
import { uuidSchema } from "@global-entity";

const isAddressValid = async (): Promise<boolean> => {
  const { address: addressString, country } = contextStore.context;
  if (!addressString) return false;
  const address = await decryptObjectString<Address>(addressString);
  if (address.country !== country.code) return false;
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

export const validations: Record<CheckoutStageName, () => Promise<boolean>> = {
  [CheckoutStageNameEnum.ADDRESS]: isAddressValid,
  [CheckoutStageNameEnum.PERSONAL_DETAILS]: isUserDetailsValid,
  [CheckoutStageNameEnum.SHIPPING]: isShippingMethodValid,
  [CheckoutStageNameEnum.REVIEW]: isReviewValid,
};
