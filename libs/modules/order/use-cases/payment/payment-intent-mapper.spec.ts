import { mapPaymentIntentEvent } from "./payment-intent-mapper";
import * as PaymentModule from "./get-payment-from-payment-intent";
import {
  stripeCheckoutPaymentIntentResultCanceledEventMock,
  stripeCheckoutPaymentIntentResultCreatedEventMock,
  stripeCheckoutPaymentIntentResultFailedEventMock,
  stripeCheckoutPaymentIntentResultProcessingEventMock,
  stripeCheckoutPaymentIntentResultSucceededEventMock,
  stripeCheckoutPaymentIntentResultSucceededMock,
  stripeCheckoutSessionResultEventmock,
} from "@mocks-utils";
import { Payment, PaymentIntentState } from "@payment-entity";
import { errors } from "@error-handling-utils";

jest.mock("./get-payment-from-payment-intent", () => ({
  getPaymentFromPaymentIntentSucceededEvent: jest.fn(),
  getPaymentFromPaymentIntentCreatedEvent: jest.fn(),
  getPaymentFromPaymentIntentProcessingEvent: jest.fn(),
  getPaymentFromPaymentIntentCanceledEvent: jest.fn(),
  getPaymentFromPaymentIntentFailedEvent: jest.fn(),
}));

jest.mock("@logger-utils", () => ({
  logger: jest.fn().mockReturnValue({ addData: jest.fn(), info: jest.fn() }),
}));

jest.mock("@jwt-utils", () => ({}));

describe("paymentIntentMapper", () => {
  const getPaymentFromPaymentIntentSucceededEventSpy = jest.spyOn(
    PaymentModule,
    "getPaymentFromPaymentIntentSucceededEvent",
  );
  const getPaymentFromPaymentIntentCreatedEventSpy = jest.spyOn(
    PaymentModule,
    "getPaymentFromPaymentIntentCreatedEvent",
  );
  const getPaymentFromPaymentIntentProcessingEventSpy = jest.spyOn(
    PaymentModule,
    "getPaymentFromPaymentIntentProcessingEvent",
  );
  const getPaymentFromPaymentIntentCanceledEventSpy = jest.spyOn(
    PaymentModule,
    "getPaymentFromPaymentIntentCanceledEvent",
  );
  const getPaymentFromPaymentIntentFailedEventSpy = jest.spyOn(
    PaymentModule,
    "getPaymentFromPaymentIntentFailedEvent",
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it.each([
    [
      "created",
      stripeCheckoutPaymentIntentResultCreatedEventMock,
      getPaymentFromPaymentIntentCreatedEventSpy,
    ],
    [
      "succeeded",
      stripeCheckoutPaymentIntentResultSucceededEventMock,
      getPaymentFromPaymentIntentSucceededEventSpy,
    ],
    [
      "processing",
      stripeCheckoutPaymentIntentResultProcessingEventMock,
      getPaymentFromPaymentIntentProcessingEventSpy,
    ],
    [
      "canceled",
      stripeCheckoutPaymentIntentResultCanceledEventMock,
      getPaymentFromPaymentIntentCanceledEventSpy,
    ],
    [
      "failed",
      stripeCheckoutPaymentIntentResultFailedEventMock,
      getPaymentFromPaymentIntentFailedEventSpy,
    ],
  ])(
    "should map payment intent %s event to payment",
    async (state, event, spy) => {
      const payment: Payment = {
        createdAt: "2022-01-01T00:00:00.000Z",
        paymentId: "paymentIntentId",
        amount: 1000,
        state: PaymentIntentState[state as keyof typeof PaymentIntentState],
        type: "card" as const,
      };
      spy.mockResolvedValueOnce(payment);
      const result = await mapPaymentIntentEvent(event);

      expect(result).toEqual(payment);
    },
  );
  it("should throw error if event is not a stripe event", async () => {
    await expect(
      async () =>
        await mapPaymentIntentEvent(
          stripeCheckoutPaymentIntentResultSucceededMock,
        ),
    ).rejects.toEqual(errors.INVALID_PAYLOAD("Payload is not a Stripe Event"));
  });
  it("should throw error if event is not a stripe payment intent event", async () => {
    await expect(
      async () =>
        await mapPaymentIntentEvent(stripeCheckoutSessionResultEventmock),
    ).rejects.toEqual(
      errors.INVALID_PAYLOAD("Payload is not a Stripe Payment Intent Event"),
    );
  });
});
