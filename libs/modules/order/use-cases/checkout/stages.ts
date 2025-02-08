import {
  CheckoutStageEnum,
  CheckoutStageEnumType,
} from "@checkout-session-entity";
import { contextStore } from "@context-utils";

export const getAvailableCheckoutStages = async (): Promise<
  CheckoutStageEnumType[]
> => {
  const availableCheckoutStages: CheckoutStageEnumType[] = [];
  const { address, userDetails, shippingMethod, cartId } = contextStore.context;
  if (!cartId) {
    return availableCheckoutStages;
  }
  availableCheckoutStages.push(CheckoutStageEnum.ADDRESS);
  if (address) {
    availableCheckoutStages.push(CheckoutStageEnum.PERSONAL_DETAILS);
  }
  if (userDetails) {
    availableCheckoutStages.push(CheckoutStageEnum.SHIPPING);
  }
  if (shippingMethod) {
    availableCheckoutStages.push(CheckoutStageEnum.REVIEW);
  }

  return availableCheckoutStages;
};
