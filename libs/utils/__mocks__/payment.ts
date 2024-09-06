import { InsertPayment } from "@payment-entity";

export const succeededPaymentMock: InsertPayment = {
  type: "card",
  paymentId: "1",
  amount: 1,
  state: "succeeded",
};

export const createdPaymentMock: InsertPayment = {
  type: "card",
  paymentId: "1",
  amount: 1,
  state: "created",
};

export const canceledPaymentMock: InsertPayment = {
  type: "card",
  paymentId: "1",
  amount: 1,
  state: "canceled",
};

export const failedPaymentMock: InsertPayment = {
  type: "card",
  paymentId: "1",
  amount: 1,
  state: "failed",
};

export const processingPaymentMock: InsertPayment = {
  type: "card",
  paymentId: "1",
  amount: 1,
  state: "processing",
};

export const draftPaymentMock: InsertPayment = {
  paymentId: "1",
  amount: 1,
  state: "draft",
  type: "draft",
};
