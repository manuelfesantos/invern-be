import {
  getPaymentFromPaymentIntent,
  getPaymentFromSessionResult,
  PaymentIntentState,
  PaymentMethodType,
} from "@payment-entity";
import {
  stripeCheckoutPaymentIntentResultSucceededMock,
  stripeCheckoutSessionResultMockWithoutUserId,
} from "@mocks-utils";
import { errors } from "@error-handling-utils";

const VALUE_ZERO = 0;
const VALUE_MINUS_ONE = -1;

describe("getPayment", () => {
  describe("from session result", () => {
    it("should get payment", () => {
      const payment = getPaymentFromSessionResult(
        stripeCheckoutSessionResultMockWithoutUserId,
      );

      expect(payment).toEqual({
        id: stripeCheckoutSessionResultMockWithoutUserId.payment_intent,
        type: PaymentMethodType.draft,
        grossAmount: stripeCheckoutSessionResultMockWithoutUserId.amount_total,
        netAmount: stripeCheckoutSessionResultMockWithoutUserId.amount_subtotal,
        state: PaymentIntentState.draft,
      });
    });
    it("should throw error if payment_intent is missing or is invalid", () => {
      const sessionResult = {
        ...stripeCheckoutSessionResultMockWithoutUserId,
        payment_intent: null,
      };

      expect(() => getPaymentFromSessionResult(sessionResult)).toThrow(
        errors.INVALID_PAYMENT("payment_intent is required"),
      );
    });

    it.each([
      ["missing", VALUE_ZERO],
      ["null", null],
      ["invalid", VALUE_MINUS_ONE],
    ])(
      "should throw error if amount_total is missing or is invalid",
      (_, value) => {
        const sessionResult = {
          ...stripeCheckoutSessionResultMockWithoutUserId,
          amount_total: value,
        };

        expect(() => getPaymentFromSessionResult(sessionResult)).toThrow(
          errors.INVALID_PAYMENT("amount is either missing or invalid"),
        );
      },
    );
  });

  describe("from payment intent", () => {
    it("should get payment", () => {
      const payment = getPaymentFromPaymentIntent(
        stripeCheckoutPaymentIntentResultSucceededMock,
        PaymentIntentState.succeeded,
      );

      expect(payment).toEqual({
        id: stripeCheckoutPaymentIntentResultSucceededMock.id,
        type: PaymentMethodType.card,
        grossAmount: stripeCheckoutPaymentIntentResultSucceededMock.amount,
        state: PaymentIntentState.succeeded,
      });
    });

    it("should throw error if payment_intent is missing or is invalid", () => {
      const paymentIntent = {
        ...stripeCheckoutPaymentIntentResultSucceededMock,
        id: "",
      };

      expect(() =>
        getPaymentFromPaymentIntent(
          paymentIntent,
          PaymentIntentState.succeeded,
        ),
      ).toThrow(errors.INVALID_PAYMENT("payment_intent is required"));
    });

    it.each([
      ["missing", VALUE_ZERO],
      ["invalid", VALUE_MINUS_ONE],
    ])("should throw error if amount is %s", (_, value) => {
      const paymentIntent = {
        ...stripeCheckoutPaymentIntentResultSucceededMock,
        amount: value,
      };

      expect(() =>
        getPaymentFromPaymentIntent(
          paymentIntent,
          PaymentIntentState.succeeded,
        ),
      ).toThrow(errors.INVALID_PAYMENT("amount is either missing or invalid"));
    });
  });
});
