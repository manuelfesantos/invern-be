import { ClientOrder, OrderStatus, OrderStatusType } from "@order-entity";
import { PaymentIntentState } from "@payment-entity";
import { ShippingTransactionStatusEnum } from "@shipping-transaction-entity";
import { logger } from "@logger-utils";
import { LoggerUseCaseEnum } from "@logger-entity";

interface OrderStatusChecker {
  (order: ClientOrder): OrderStatusType | undefined;
}

export const getOrderStatus = (order: ClientOrder): OrderStatusType => {
  for (const check of orderStatusChecks) {
    const status = check(order);
    if (status) {
      return status;
    }
  }
  logger().warn("Order status not found", {
    useCase: LoggerUseCaseEnum.GET_ORDER,
    data: { order },
  });
  return OrderStatus.error;
};

const isOrderCanceled: OrderStatusChecker = (order) => {
  const { payment, isCanceled } = order;
  if (
    isCanceled ||
    (payment &&
      (payment.state === PaymentIntentState.canceled ||
        payment.state === PaymentIntentState.failed))
  ) {
    return OrderStatus.canceled;
  }
};

const isOrderProcessingPayment: OrderStatusChecker = (order) => {
  const { payment } = order;
  if (!payment || payment.state !== PaymentIntentState.succeeded) {
    return OrderStatus.processing_payment;
  }
};

const isOrderPackaging: OrderStatusChecker = (order) => {
  const { payment, shippingTransaction } = order;
  if (
    payment &&
    payment.state === PaymentIntentState.succeeded &&
    shippingTransaction.status === ShippingTransactionStatusEnum.processing
  ) {
    return OrderStatus.packaging;
  }
};

const isOrderShipping: OrderStatusChecker = (order) => {
  const { shippingTransaction } = order;
  if (shippingTransaction.status === ShippingTransactionStatusEnum.shipped) {
    return OrderStatus.shipping;
  }
};

const isOrderCompleted: OrderStatusChecker = (order) => {
  const { shippingTransaction } = order;
  if (shippingTransaction.status === ShippingTransactionStatusEnum.delivered) {
    return OrderStatus.completed;
  }
};

const orderStatusChecks: OrderStatusChecker[] = [
  isOrderCanceled,
  isOrderProcessingPayment,
  isOrderPackaging,
  isOrderShipping,
  isOrderCompleted,
];
