import { Payment } from "@payment-entity";
import {
  getPaymentFromPaymentIntentCanceledEvent,
  getPaymentFromPaymentIntentCreatedEvent,
  getPaymentFromPaymentIntentFailedEvent,
  getPaymentFromPaymentIntentProcessingEvent,
  getPaymentFromPaymentIntentSucceededEvent,
} from "@order-module";
import { isStripeEvent, isStripePaymentIntent } from "@stripe-entity";
import { errors } from "@error-handling-utils";
import { z } from "zod";
import { logger } from "@logger-utils";
import { LoggerUseCaseEnum } from "@logger-entity";

const paymentIntentEventMap = {
  "payment_intent.created": getPaymentFromPaymentIntentCreatedEvent,
  "payment_intent.succeeded": getPaymentFromPaymentIntentSucceededEvent,
  "payment_intent.canceled": getPaymentFromPaymentIntentCanceledEvent,
  "payment_intent.processing": getPaymentFromPaymentIntentProcessingEvent,
  "payment_intent.payment_failed": getPaymentFromPaymentIntentFailedEvent,
};

const paymentIntentTypeSchema = z.enum(
  [
    "payment_intent.created",
    "payment_intent.succeeded",
    "payment_intent.canceled",
    "payment_intent.processing",
    "payment_intent.payment_failed",
  ],
  {
    message: "invalid payment intent type",
    required_error: "payment intent type is required",
  },
);

export const mapPaymentIntentEvent = async (
  event: unknown,
): Promise<Payment> => {
  if (!isStripeEvent(event)) {
    throw errors.INVALID_PAYLOAD("Payload is not a Stripe Event");
  }

  const paymentIntent = event.data.object;

  if (!isStripePaymentIntent(paymentIntent)) {
    throw errors.INVALID_PAYLOAD(
      "Payload is not a Stripe Payment Intent Event",
    );
  }

  const paymentIntentType = paymentIntentTypeSchema.parse(event.type);

  logger().info(
    `Payment Intent Type: ${paymentIntentType}`,
    LoggerUseCaseEnum.GET_PAYMENT_INTENT,
  );

  return await paymentIntentEventMap[paymentIntentType](paymentIntent);
};
