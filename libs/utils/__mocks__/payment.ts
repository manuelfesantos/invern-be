import { InsertPayment, Payment } from "@payment-entity";

export const succeededPaymentMock: InsertPayment = {
  type: "card",
  id: "1",
  grossAmount: 1,
  state: "succeeded",
};

export const createdPaymentMock: InsertPayment = {
  type: "card",
  id: "1",
  grossAmount: 1,
  state: "created",
};

export const canceledPaymentMock: InsertPayment = {
  type: "card",
  id: "1",
  grossAmount: 1,
  state: "canceled",
};

export const failedPaymentMock: InsertPayment = {
  type: "card",
  id: "1",
  grossAmount: 1,
  state: "failed",
};

export const processingPaymentMock: InsertPayment = {
  type: "card",
  id: "1",
  grossAmount: 1,
  state: "processing",
};

export const draftPaymentMock: Payment = {
  createdAt: "",
  id: "1",
  grossAmount: 1,
  netAmount: 0,
  state: "draft",
  type: "draft",
};
