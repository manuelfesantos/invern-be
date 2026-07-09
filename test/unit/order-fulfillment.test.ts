/**
 * Order/fulfillment: the transition state machine (pure), the cancel↔shipping-
 * transaction coupling, and the constrained order update (financial/immutable
 * fields can't be written). DB actions are mocked where needed.
 */
jest.mock("@order-db", () => ({
  __esModule: true,
  ...jest.requireActual("@order-db"),
  getSelectOrdersByIdAction: jest.fn(),
  getUpdateOrderAction: jest.fn(),
}));
jest.mock("@shipping-transaction-db", () => ({
  __esModule: true,
  ...jest.requireActual("@shipping-transaction-db"),
  getUpdateShippingTransactionAction: jest.fn(),
}));

import { getSelectOrdersByIdAction, getUpdateOrderAction } from "@order-db";
import { getUpdateShippingTransactionAction } from "@shipping-transaction-db";
import { assertValidTransition } from "../../libs/modules/order/use-cases/fulfillment/transitions";
import { cancelOrder } from "../../libs/modules/order/use-cases/cancel-order";
import { updateOrder } from "../../libs/modules/order/use-cases/update-order";
import { withTestContext } from "../harness";

const selOrder = getSelectOrdersByIdAction as unknown as jest.Mock;
const updOrder = getUpdateOrderAction as unknown as jest.Mock;
const updTxn = getUpdateShippingTransactionAction as unknown as jest.Mock;

const actionReturning = (value: unknown) => ({
  run: () => Promise.resolve(value),
});
const orderWith = (status: string) => ({
  id: "o1",
  isCanceled: false,
  shippingTransaction: { id: "st1", status },
});

beforeEach(() => {
  selOrder.mockReset();
  updOrder.mockReset().mockReturnValue(actionReturning(undefined));
  updTxn.mockReset().mockReturnValue(actionReturning(undefined));
});

describe("assertValidTransition (fulfillment state machine)", () => {
  it("allows the forward flow and cancellations", () => {
    expect(() => assertValidTransition("processing", "shipped")).not.toThrow();
    expect(() => assertValidTransition("processing", "canceled")).not.toThrow();
    expect(() => assertValidTransition("shipped", "delivered")).not.toThrow();
    expect(() => assertValidTransition("shipped", "canceled")).not.toThrow();
    expect(() => assertValidTransition("shipped", "shipped")).not.toThrow(); // no-op
  });
  it("rejects illegal jumps and transitions out of terminal states", () => {
    expect(() => assertValidTransition("processing", "delivered")).toThrow();
    expect(() => assertValidTransition("delivered", "processing")).toThrow();
    expect(() => assertValidTransition("delivered", "shipped")).toThrow();
    expect(() => assertValidTransition("canceled", "shipped")).toThrow();
  });
});

describe("cancelOrder ↔ shipping-transaction coupling", () => {
  it("cancels the shipping transaction too when it is not delivered", async () => {
    selOrder.mockReturnValue(actionReturning([orderWith("processing")]));
    await cancelOrder("o1");
    expect(updOrder).toHaveBeenCalledWith("o1", { isCanceled: true });
    expect(updTxn).toHaveBeenCalledWith("st1", { status: "canceled" });
  });

  it("leaves a delivered transaction alone when the order is canceled", async () => {
    selOrder.mockReturnValue(actionReturning([orderWith("delivered")]));
    await cancelOrder("o1");
    expect(updOrder).toHaveBeenCalledWith("o1", { isCanceled: true });
    expect(updTxn).not.toHaveBeenCalled();
  });
});

describe("updateOrder (constrained admin update)", () => {
  const ADDRESS = {
    street: "Rua A",
    houseNumber: "1",
    postalCode: "1000-001",
    city: "Lisboa",
    country: "PT",
  };

  it("writes only whitelisted fields and ignores financial/immutable ones", async () => {
    selOrder.mockReturnValue(actionReturning([orderWith("processing")]));
    await withTestContext(() =>
      updateOrder("o1", {
        address: ADDRESS,
        stripeId: "HACK",
        paymentId: "HACK",
        products: [],
        isCanceled: true,
      }),
    );
    expect(updOrder).toHaveBeenCalledTimes(1);
    const [, update] = updOrder.mock.calls[0];
    expect(Object.keys(update)).toEqual(["address"]); // stripeId/paymentId/etc. stripped
    expect(update).not.toHaveProperty("stripeId");
    expect(update).not.toHaveProperty("isCanceled");
  });

  it("does not issue a DB write when no whitelisted field is present", async () => {
    selOrder.mockReturnValue(actionReturning([orderWith("processing")]));
    await withTestContext(() => updateOrder("o1", { stripeId: "HACK" }));
    expect(updOrder).not.toHaveBeenCalled();
  });
});
