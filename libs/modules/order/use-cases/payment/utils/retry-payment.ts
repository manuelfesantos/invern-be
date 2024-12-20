import { PaymentIntent } from "@stripe-entity";
import { Payment } from "@payment-entity";

const MAX_RETRIES = 1;
const ONE_INCREMENT = 1;
const MIN_RETRIES = 0;
export const withRetry = async (
  paymentIntent: PaymentIntent,
  callBack: (paymentIntent: PaymentIntent) => Promise<Payment>,
  retries: number = MIN_RETRIES,
): Promise<Payment> => {
  try {
    return callBack(paymentIntent);
  } catch (error) {
    if (retries < MAX_RETRIES) {
      return withRetry(paymentIntent, callBack, retries + ONE_INCREMENT);
    }
    throw error;
  }
};
