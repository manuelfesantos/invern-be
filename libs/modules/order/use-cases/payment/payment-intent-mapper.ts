import { Payment } from "@payment-entity";
import {
  getPaymentFromPaymentIntentCanceledEvent,
  getPaymentFromPaymentIntentCreatedEvent,
  getPaymentFromPaymentIntentFailedEvent,
  getPaymentFromPaymentIntentProcessingEvent,
  getPaymentFromPaymentIntentSucceededEvent,
} from "@order-module";
import { z } from "zod";
import { logger } from "@logger-utils";
import { LoggerUseCaseEnum } from "@logger-entity";
import { withRetry } from "./utils/retry-payment";
import Stripe from "stripe";

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
  paymentIntent: Stripe.PaymentIntent,
  eventType: Stripe.Event.Type,
): Promise<Payment> => {
  const paymentIntentType = paymentIntentTypeSchema.parse(eventType);

  logger().info(
    `Payment Intent Type: ${paymentIntentType}`,
    LoggerUseCaseEnum.GET_PAYMENT_INTENT,
  );

  logger().addRedactedData({ paymentId: paymentIntent.id });

  return await withRetry(
    paymentIntent,
    paymentIntentEventMap[paymentIntentType],
  );
};
