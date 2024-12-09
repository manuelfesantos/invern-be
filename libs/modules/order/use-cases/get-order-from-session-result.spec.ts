import { getOrderFromSessionResult } from "@order-module";
import {
  addressMock,
  clientOrderMock,
  orderMock,
  stripeAddressMock,
  stripeCheckoutSessionResultMockWithoutUserId,
  stripeCheckoutSessionResultMockWithUserId,
} from "@mocks-utils";
import * as OrderDb from "@order-db";
import * as AddressDb from "@address-db";
import * as AddressEntity from "@address-entity";
import * as PaymentEntity from "@payment-entity";
import * as PaymentDb from "@payment-db";
import * as UserDb from "@user-db";
import * as CartDb from "@cart-db";

const ONE_TIME = 1;

jest.mock("@jwt-utils", () => ({}));

jest.mock("@logger-utils", () => ({
  logger: jest.fn().mockReturnValue({ addData: jest.fn() }),
}));

jest.mock("@order-db", () => ({
  checkIfOrderExists: jest.fn(),
  insertOrder: jest.fn(),
  addToOrder: jest.fn(),
  getOrderById: jest.fn(),
}));

jest.mock("@checkout-session-db", () => ({
  popCheckoutSessionById: jest.fn(() => [
    {
      products: '[{"productId": "4hiuURKg6ajRFTD5YSrd6F", "quantity": 2}]',
      userId: "qsRTdjB1g5nKTa8tb6JGmC",
      cartId: "bL7HQaCXkhwDQXEyuzrzig",
    },
  ]),
}));

jest.mock("@user-db", () => ({
  incrementUserVersion: jest.fn(),
}));

jest.mock("@cart-db", () => ({
  emptyCart: jest.fn(),
}));

jest.mock("@address-db", () => ({
  insertAddress: jest.fn(),
}));

jest.mock("@payment-entity", () => ({
  ...jest.requireActual("@payment-entity"),
  getPaymentFromSessionResult: jest.fn(),
}));

jest.mock("@payment-db", () => ({
  getPaymentById: jest.fn(),
  insertPaymentReturningId: jest.fn(),
}));

jest.mock("@address-entity", () => ({
  ...jest.requireActual("@address-entity"),
  validateStripeAddress: jest.fn(),
}));

const paymentId = "1";
const orderId = stripeCheckoutSessionResultMockWithoutUserId.id;

describe("getOrderFromSessionResult", () => {
  const checkIfOrderAlreadyExistsSpy = jest.spyOn(
    OrderDb,
    "checkIfOrderExists",
  );
  const insertAddressSpy = jest.spyOn(AddressDb, "insertAddress");
  const validateStripeAddressSpy = jest.spyOn(
    AddressEntity,
    "validateStripeAddress",
  );
  const getPaymentFromSessionResultSpy = jest.spyOn(
    PaymentEntity,
    "getPaymentFromSessionResult",
  );
  const getPaymentByIdSpy = jest.spyOn(PaymentDb, "getPaymentById");
  const insertPaymentReturningIdSpy = jest.spyOn(
    PaymentDb,
    "insertPaymentReturningId",
  );
  const insertOrderSpy = jest.spyOn(OrderDb, "insertOrder");
  const addToOrderSpy = jest.spyOn(OrderDb, "addToOrder");
  const getOrderByIdSpy = jest.spyOn(OrderDb, "getOrderById");
  const incrementUserVersionSpy = jest.spyOn(UserDb, "incrementUserVersion");
  const emptyCartSpy = jest.spyOn(CartDb, "emptyCart");
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it("should get order from session result without userId", async () => {
    const paymentDraft = {
      paymentId,
      amount: 1,
      state: "draft" as const,
      type: "draft" as const,
    };

    checkIfOrderAlreadyExistsSpy.mockResolvedValue(false);
    validateStripeAddressSpy.mockReturnValueOnce(stripeAddressMock);
    insertAddressSpy.mockResolvedValue([{ addressId: addressMock.addressId }]);
    getPaymentFromSessionResultSpy.mockReturnValueOnce(paymentDraft);
    getPaymentByIdSpy.mockResolvedValueOnce(undefined);
    insertPaymentReturningIdSpy.mockResolvedValueOnce([{ paymentId }]);
    insertOrderSpy.mockResolvedValueOnce([{ orderId }]);
    getOrderByIdSpy.mockResolvedValueOnce({ ...orderMock, orderId });
    const order = await getOrderFromSessionResult(
      stripeCheckoutSessionResultMockWithoutUserId,
    );
    expect(order).toEqual(clientOrderMock);
    expect(checkIfOrderAlreadyExistsSpy).toHaveBeenCalledWith(orderId);
    expect(validateStripeAddressSpy).toHaveBeenCalledWith(
      stripeCheckoutSessionResultMockWithoutUserId.customer_details?.address,
    );
    expect(insertAddressSpy).toHaveBeenCalledWith(stripeAddressMock);
    expect(getPaymentFromSessionResultSpy).toHaveBeenCalledWith(
      stripeCheckoutSessionResultMockWithoutUserId,
    );
    expect(getPaymentByIdSpy).toHaveBeenCalledWith(paymentId);
    expect(insertPaymentReturningIdSpy).toHaveBeenCalledWith(paymentDraft);
    expect(insertOrderSpy).toHaveBeenCalledWith({
      addressId: addressMock.addressId,
      paymentId,
      userId: "qsRTdjB1g5nKTa8tb6JGmC",
      orderId,
      clientOrderId:
        stripeCheckoutSessionResultMockWithoutUserId.metadata?.clientOrderId,
      snapshot: null,
    });
    expect(addToOrderSpy).toHaveBeenCalledTimes(ONE_TIME);
    expect(getOrderByIdSpy).toHaveBeenCalledWith(orderId);
    expect(emptyCartSpy).toHaveBeenCalledWith("bL7HQaCXkhwDQXEyuzrzig");
    expect(incrementUserVersionSpy).toHaveBeenCalledWith(
      "qsRTdjB1g5nKTa8tb6JGmC",
    );
  });
  it("should get order from session result with userId", async () => {
    const paymentDraft = {
      paymentId,
      amount: 1,
      state: "draft" as const,
      type: "draft" as const,
    };

    checkIfOrderAlreadyExistsSpy.mockResolvedValue(false);
    validateStripeAddressSpy.mockReturnValueOnce(stripeAddressMock);
    insertAddressSpy.mockResolvedValue([{ addressId: addressMock.addressId }]);
    getPaymentFromSessionResultSpy.mockReturnValueOnce(paymentDraft);
    getPaymentByIdSpy.mockResolvedValueOnce(undefined);
    insertPaymentReturningIdSpy.mockResolvedValueOnce([{ paymentId }]);
    insertOrderSpy.mockResolvedValueOnce([{ orderId }]);
    getOrderByIdSpy.mockResolvedValueOnce({ ...orderMock, orderId });
    const order = await getOrderFromSessionResult(
      stripeCheckoutSessionResultMockWithUserId,
    );
    expect(order).toEqual(clientOrderMock);
    expect(checkIfOrderAlreadyExistsSpy).toHaveBeenCalledWith(orderId);
    expect(validateStripeAddressSpy).toHaveBeenCalledWith(
      stripeCheckoutSessionResultMockWithUserId.customer_details?.address,
    );
    expect(insertAddressSpy).toHaveBeenCalledWith(stripeAddressMock);
    expect(getPaymentFromSessionResultSpy).toHaveBeenCalledWith(
      stripeCheckoutSessionResultMockWithUserId,
    );
    expect(getPaymentByIdSpy).toHaveBeenCalledWith(paymentId);
    expect(insertPaymentReturningIdSpy).toHaveBeenCalledWith(paymentDraft);
    expect(insertOrderSpy).toHaveBeenCalledWith({
      addressId: addressMock.addressId,
      paymentId,
      userId: "qsRTdjB1g5nKTa8tb6JGmC",
      orderId,
      clientOrderId:
        stripeCheckoutSessionResultMockWithUserId.metadata?.clientOrderId,
      snapshot: null,
    });
    expect(addToOrderSpy).toHaveBeenCalledTimes(ONE_TIME);
    expect(getOrderByIdSpy).toHaveBeenCalledWith(orderId);
    expect(emptyCartSpy).toHaveBeenCalledWith("bL7HQaCXkhwDQXEyuzrzig");
    expect(incrementUserVersionSpy).toHaveBeenCalledWith(
      "qsRTdjB1g5nKTa8tb6JGmC",
    );
  });
  it("should not get order if order already exists", async () => {
    checkIfOrderAlreadyExistsSpy.mockResolvedValue(true);
    await expect(
      async () =>
        await getOrderFromSessionResult(
          stripeCheckoutSessionResultMockWithUserId,
        ),
    ).rejects.toEqual(
      expect.objectContaining({ message: "Order already exists", code: 409 }),
    );
    expect(checkIfOrderAlreadyExistsSpy).toHaveBeenCalledWith(orderId);
    expect(validateStripeAddressSpy).not.toHaveBeenCalled();
    expect(insertAddressSpy).not.toHaveBeenCalled();
    expect(getPaymentFromSessionResultSpy).not.toHaveBeenCalled();
    expect(getPaymentByIdSpy).not.toHaveBeenCalled();
    expect(insertPaymentReturningIdSpy).not.toHaveBeenCalled();
    expect(insertOrderSpy).not.toHaveBeenCalled();
    expect(addToOrderSpy).not.toHaveBeenCalled();
    expect(getOrderByIdSpy).not.toHaveBeenCalled();
    expect(emptyCartSpy).not.toHaveBeenCalled();
    expect(incrementUserVersionSpy).not.toHaveBeenCalled();
  });
  it("should not return order if getOrderById does not return an order", async () => {
    const paymentDraft = {
      paymentId,
      amount: 1,
      state: "draft" as const,
      type: "draft" as const,
    };
    checkIfOrderAlreadyExistsSpy.mockResolvedValue(false);
    validateStripeAddressSpy.mockReturnValueOnce(stripeAddressMock);
    insertAddressSpy.mockResolvedValue([{ addressId: addressMock.addressId }]);
    getPaymentFromSessionResultSpy.mockReturnValueOnce(paymentDraft);
    getPaymentByIdSpy.mockResolvedValueOnce(undefined);
    insertPaymentReturningIdSpy.mockResolvedValueOnce([{ paymentId }]);
    insertOrderSpy.mockResolvedValueOnce([{ orderId }]);
    getOrderByIdSpy.mockResolvedValueOnce(undefined);
    await expect(
      async () =>
        await getOrderFromSessionResult(
          stripeCheckoutSessionResultMockWithUserId,
        ),
    ).rejects.toEqual(
      expect.objectContaining({ message: "Unable to create order" }),
    );
    expect(getOrderByIdSpy).toHaveBeenCalledWith(orderId);
    expect(emptyCartSpy).not.toHaveBeenCalled();
    expect(incrementUserVersionSpy).not.toHaveBeenCalled();
  });
});
