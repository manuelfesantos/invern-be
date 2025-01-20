import {
  getPaymentFromPaymentIntentCanceledEvent,
  getPaymentFromPaymentIntentCreatedEvent,
  getPaymentFromPaymentIntentFailedEvent,
  getPaymentFromPaymentIntentProcessingEvent,
  getPaymentFromPaymentIntentSucceededEvent,
} from "@order-module";
import {
  canceledPaymentMock,
  createdPaymentMock,
  draftPaymentMock,
  failedPaymentMock,
  processingPaymentMock,
  productIdAndQuantityMock,
  productsMock,
  stripeCheckoutPaymentIntentResultCanceledMock,
  stripeCheckoutPaymentIntentResultCreatedMock,
  stripeCheckoutPaymentIntentResultFailedMock,
  stripeCheckoutPaymentIntentResultProcessingMock,
  stripeCheckoutPaymentIntentResultSucceededMock,
  succeededPaymentMock,
} from "@mocks-utils";
import * as PaymentDb from "@payment-db";
import * as PaymentEntity from "@payment-entity";
import { PaymentIntentState } from "@payment-entity";
import { errors } from "@error-handling-utils";
import * as OrderDb from "@order-db";
import * as ProductDb from "@product-db";

jest.mock("@payment-entity", () => ({
  ...jest.requireActual("@payment-entity"),
  getPaymentFromPaymentIntent: jest.fn(),
}));

jest.mock("@payment-db", () => ({
  getPaymentById: jest.fn(),
  updatePayment: jest.fn(),
  insertPaymentReturningAll: jest.fn(),
}));

jest.mock("@jwt-utils", () => ({}));

jest.mock("@order-db", () => ({
  getOrderProductsByPaymentId: jest.fn(),
}));

jest.mock("@product-db", () => ({
  increaseProductsStock: jest.fn(() => productsMock),
}));

jest.mock("@logger-utils", () => ({
  redactPropertiesFromData: jest.fn(),
  logger: jest.fn().mockReturnValue({ info: jest.fn(), error: jest.fn() }),
}));

jest.mock("@r2-adapter", () => ({
  stockClient: {
    update: jest.fn(),
  },
}));

const insertedPaymentDraftMock = {
  ...draftPaymentMock,
  createdAt: "today",
};
const insertedPaymentCreatedMock = {
  ...insertedPaymentDraftMock,
  state: PaymentIntentState.created,
};
const insertedPaymentProcessingMock = {
  ...insertedPaymentDraftMock,
  state: PaymentIntentState.processing,
};
const insertedPaymentSucceededMock = {
  ...insertedPaymentDraftMock,
  state: PaymentIntentState.succeeded,
};
const insertedPaymentFailedMock = {
  ...insertedPaymentDraftMock,
  state: PaymentIntentState.failed,
};
const insertedPaymentCanceledMock = {
  ...insertedPaymentDraftMock,
  state: PaymentIntentState.canceled,
};

describe("getPaymentFromPaymentIntent", () => {
  const getPaymentByIdSpy = jest.spyOn(PaymentDb, "getPaymentById");
  const updatePaymentSpy = jest.spyOn(PaymentDb, "updatePayment");
  const insertPaymentReturningAllSpy = jest.spyOn(
    PaymentDb,
    "insertPaymentReturningAll",
  );
  const getPaymentFromPaymentIntentSpy = jest.spyOn(
    PaymentEntity,
    "getPaymentFromPaymentIntent",
  );
  const getOrderProductsByPaymentIdSpy = jest.spyOn(
    OrderDb,
    "getOrderProductsByPaymentId",
  );
  const increaseProductsStockSpy = jest.spyOn(
    ProductDb,
    "increaseProductsStock",
  );
  beforeEach(() => {
    jest.clearAllMocks();
  });
  describe("succeededEvent", () => {
    it("should create payment if payment does not exist", async () => {
      getPaymentFromPaymentIntentSpy.mockReturnValueOnce(succeededPaymentMock);
      getPaymentByIdSpy.mockResolvedValueOnce(undefined);
      insertPaymentReturningAllSpy.mockResolvedValueOnce([
        insertedPaymentSucceededMock,
      ]);
      const payment = await getPaymentFromPaymentIntentSucceededEvent(
        stripeCheckoutPaymentIntentResultSucceededMock,
      );
      expect(payment).toEqual(insertedPaymentSucceededMock);
      expect(updatePaymentSpy).not.toHaveBeenCalled();
    });

    it("should update payment if payment exists", async () => {
      getPaymentFromPaymentIntentSpy.mockReturnValueOnce(succeededPaymentMock);
      getPaymentByIdSpy.mockResolvedValueOnce(insertedPaymentSucceededMock);
      updatePaymentSpy.mockResolvedValueOnce([insertedPaymentSucceededMock]);
      const payment = await getPaymentFromPaymentIntentSucceededEvent(
        stripeCheckoutPaymentIntentResultSucceededMock,
      );
      expect(payment).toEqual(insertedPaymentSucceededMock);
      expect(updatePaymentSpy).toHaveBeenCalledWith(
        insertedPaymentSucceededMock.id,
        succeededPaymentMock,
      );
      expect(insertPaymentReturningAllSpy).not.toHaveBeenCalled();
    });
  });

  describe("createdEvent", () => {
    it("should create payment if payment does not exist", async () => {
      getPaymentFromPaymentIntentSpy.mockReturnValueOnce(createdPaymentMock);
      getPaymentByIdSpy.mockResolvedValueOnce(undefined);
      insertPaymentReturningAllSpy.mockResolvedValueOnce([
        insertedPaymentCreatedMock,
      ]);
      const payment = await getPaymentFromPaymentIntentCreatedEvent(
        stripeCheckoutPaymentIntentResultCreatedMock,
      );
      expect(payment).toEqual(insertedPaymentCreatedMock);
      expect(updatePaymentSpy).not.toHaveBeenCalled();
    });

    it("should update payment if payment exists and is in draft state", async () => {
      getPaymentFromPaymentIntentSpy.mockReturnValueOnce(createdPaymentMock);
      getPaymentByIdSpy.mockResolvedValueOnce(insertedPaymentDraftMock);
      updatePaymentSpy.mockResolvedValueOnce([insertedPaymentCreatedMock]);
      const payment = await getPaymentFromPaymentIntentCreatedEvent(
        stripeCheckoutPaymentIntentResultCreatedMock,
      );
      expect(payment).toEqual(insertedPaymentCreatedMock);
      expect(updatePaymentSpy).toHaveBeenCalledWith(
        insertedPaymentCreatedMock.id,
        createdPaymentMock,
      );
      expect(insertPaymentReturningAllSpy).not.toHaveBeenCalled();
    });

    it.each([
      [PaymentIntentState.processing, insertedPaymentProcessingMock],
      [PaymentIntentState.succeeded, insertedPaymentSucceededMock],
      [PaymentIntentState.failed, insertedPaymentFailedMock],
      [PaymentIntentState.canceled, insertedPaymentCanceledMock],
    ])(
      "should throw an error if payment exists and is in %s state",
      async (_, payment) => {
        getPaymentFromPaymentIntentSpy.mockReturnValueOnce(createdPaymentMock);
        getPaymentByIdSpy.mockResolvedValueOnce(payment);
        await expect(
          async () =>
            await getPaymentFromPaymentIntentCreatedEvent(
              stripeCheckoutPaymentIntentResultCreatedMock,
            ),
        ).rejects.toEqual(errors.PAYMENT_ALREADY_EXISTS());
        expect(updatePaymentSpy).not.toHaveBeenCalled();
        expect(insertPaymentReturningAllSpy).not.toHaveBeenCalled();
      },
    );
  });
  describe("processingEvent", () => {
    it("should create payment if payment does not exist", async () => {
      getPaymentFromPaymentIntentSpy.mockReturnValueOnce(processingPaymentMock);
      getPaymentByIdSpy.mockResolvedValueOnce(undefined);
      insertPaymentReturningAllSpy.mockResolvedValueOnce([
        insertedPaymentProcessingMock,
      ]);
      const payment = await getPaymentFromPaymentIntentProcessingEvent(
        stripeCheckoutPaymentIntentResultProcessingMock,
      );
      expect(payment).toEqual(insertedPaymentProcessingMock);
      expect(updatePaymentSpy).not.toHaveBeenCalled();
    });

    it.each([
      [PaymentIntentState.succeeded, insertedPaymentSucceededMock],
      [PaymentIntentState.failed, insertedPaymentFailedMock],
      [PaymentIntentState.canceled, insertedPaymentCanceledMock],
    ])(
      "should throw error if created payment is in %s state",
      async (_, payment) => {
        getPaymentFromPaymentIntentSpy.mockReturnValueOnce(
          processingPaymentMock,
        );
        getPaymentByIdSpy.mockResolvedValueOnce(payment);
        await expect(
          async () =>
            await getPaymentFromPaymentIntentProcessingEvent(
              stripeCheckoutPaymentIntentResultProcessingMock,
            ),
        ).rejects.toEqual(errors.PAYMENT_ALREADY_EXISTS());
        expect(updatePaymentSpy).not.toHaveBeenCalled();
        expect(insertPaymentReturningAllSpy).not.toHaveBeenCalled();
      },
    );
    it.each([
      [PaymentIntentState.created, insertedPaymentCreatedMock],
      [PaymentIntentState.draft, insertedPaymentDraftMock],
    ])(
      "should update payment if payment exists and is in %s state",
      async (_, payment) => {
        getPaymentFromPaymentIntentSpy.mockReturnValueOnce(
          processingPaymentMock,
        );
        getPaymentByIdSpy.mockResolvedValueOnce(payment);
        updatePaymentSpy.mockResolvedValueOnce([insertedPaymentProcessingMock]);
        const result = await getPaymentFromPaymentIntentProcessingEvent(
          stripeCheckoutPaymentIntentResultProcessingMock,
        );
        expect(result).toEqual(insertedPaymentProcessingMock);
        expect(updatePaymentSpy).toHaveBeenCalledWith(
          insertedPaymentProcessingMock.id,
          processingPaymentMock,
        );
        expect(insertPaymentReturningAllSpy).not.toHaveBeenCalled();
      },
    );
  });
  describe("canceledEvent", () => {
    it("should create payment if payment does not exist", async () => {
      getOrderProductsByPaymentIdSpy.mockResolvedValueOnce([]);
      getPaymentFromPaymentIntentSpy.mockReturnValueOnce(canceledPaymentMock);
      getPaymentByIdSpy.mockResolvedValueOnce(undefined);
      insertPaymentReturningAllSpy.mockResolvedValueOnce([
        insertedPaymentCanceledMock,
      ]);
      const payment = await getPaymentFromPaymentIntentCanceledEvent(
        stripeCheckoutPaymentIntentResultCreatedMock,
      );
      expect(payment).toEqual(insertedPaymentCanceledMock);
      expect(updatePaymentSpy).not.toHaveBeenCalled();
    });

    it.each([
      [PaymentIntentState.succeeded, insertedPaymentSucceededMock],
      [PaymentIntentState.canceled, insertedPaymentCanceledMock],
      [PaymentIntentState.failed, insertedPaymentFailedMock],
    ])(
      "should throw error if created payment is in %s state",
      async (_, payment) => {
        getOrderProductsByPaymentIdSpy.mockResolvedValueOnce([]);
        getPaymentFromPaymentIntentSpy.mockReturnValueOnce(canceledPaymentMock);
        getPaymentByIdSpy.mockResolvedValueOnce(payment);
        await expect(
          async () =>
            await getPaymentFromPaymentIntentCanceledEvent(
              stripeCheckoutPaymentIntentResultCreatedMock,
            ),
        ).rejects.toEqual(errors.PAYMENT_ALREADY_EXISTS());
        expect(updatePaymentSpy).not.toHaveBeenCalled();
        expect(insertPaymentReturningAllSpy).not.toHaveBeenCalled();
      },
    );
    it.each([
      [PaymentIntentState.created, insertedPaymentCreatedMock],
      [PaymentIntentState.draft, insertedPaymentDraftMock],
      [PaymentIntentState.processing, insertedPaymentProcessingMock],
    ])(
      "should update payment if payment exists and is in %s state",
      async (_, payment) => {
        getOrderProductsByPaymentIdSpy.mockResolvedValueOnce([]);
        getPaymentFromPaymentIntentSpy.mockReturnValueOnce(canceledPaymentMock);
        getPaymentByIdSpy.mockResolvedValueOnce(payment);
        updatePaymentSpy.mockResolvedValueOnce([insertedPaymentCanceledMock]);
        const result = await getPaymentFromPaymentIntentCanceledEvent(
          stripeCheckoutPaymentIntentResultCanceledMock,
        );
        expect(result).toEqual(insertedPaymentCanceledMock);
        expect(updatePaymentSpy).toHaveBeenCalledWith(
          insertedPaymentCanceledMock.id,
          canceledPaymentMock,
        );
        expect(insertPaymentReturningAllSpy).not.toHaveBeenCalled();
      },
    );
    it("should increase products stock if order was created", async () => {
      getOrderProductsByPaymentIdSpy.mockResolvedValueOnce([
        productIdAndQuantityMock,
      ]);
      getPaymentFromPaymentIntentSpy.mockReturnValueOnce(canceledPaymentMock);
      getPaymentByIdSpy.mockResolvedValueOnce(undefined);
      insertPaymentReturningAllSpy.mockResolvedValueOnce([
        insertedPaymentCanceledMock,
      ]);
      await getPaymentFromPaymentIntentCanceledEvent(
        stripeCheckoutPaymentIntentResultCanceledMock,
      );
      expect(increaseProductsStockSpy).toHaveBeenCalledWith([
        productIdAndQuantityMock,
      ]);
    });
  });
  describe("failedEvent", () => {
    it("should create payment if payment does not exist", async () => {
      getOrderProductsByPaymentIdSpy.mockResolvedValueOnce([]);
      getPaymentFromPaymentIntentSpy.mockReturnValueOnce(failedPaymentMock);
      getPaymentByIdSpy.mockResolvedValueOnce(undefined);
      insertPaymentReturningAllSpy.mockResolvedValueOnce([
        insertedPaymentFailedMock,
      ]);
      const payment = await getPaymentFromPaymentIntentFailedEvent(
        stripeCheckoutPaymentIntentResultFailedMock,
      );
      expect(payment).toEqual(insertedPaymentFailedMock);
      expect(insertPaymentReturningAllSpy).toHaveBeenCalledWith(
        failedPaymentMock,
      );
      expect(updatePaymentSpy).not.toHaveBeenCalled();
    });

    it.each([
      [PaymentIntentState.succeeded, insertedPaymentSucceededMock],
      [PaymentIntentState.canceled, insertedPaymentCanceledMock],
      [PaymentIntentState.failed, insertedPaymentFailedMock],
    ])(
      "should throw error if created payment is in %s state",
      async (_, payment) => {
        getOrderProductsByPaymentIdSpy.mockResolvedValueOnce([]);
        getPaymentFromPaymentIntentSpy.mockReturnValueOnce(failedPaymentMock);
        getPaymentByIdSpy.mockResolvedValueOnce(payment);
        await expect(
          async () =>
            await getPaymentFromPaymentIntentFailedEvent(
              stripeCheckoutPaymentIntentResultFailedMock,
            ),
        ).rejects.toEqual(errors.PAYMENT_ALREADY_EXISTS());
        expect(updatePaymentSpy).not.toHaveBeenCalled();
        expect(insertPaymentReturningAllSpy).not.toHaveBeenCalled();
      },
    );
    it.each([
      [PaymentIntentState.created, insertedPaymentCreatedMock],
      [PaymentIntentState.draft, insertedPaymentDraftMock],
      [PaymentIntentState.processing, insertedPaymentProcessingMock],
    ])(
      "should update payment if payment exists and is in %s state",
      async (_, payment) => {
        getOrderProductsByPaymentIdSpy.mockResolvedValueOnce([]);
        getPaymentFromPaymentIntentSpy.mockReturnValueOnce(failedPaymentMock);
        getPaymentByIdSpy.mockResolvedValueOnce(payment);
        updatePaymentSpy.mockResolvedValueOnce([insertedPaymentFailedMock]);
        const result = await getPaymentFromPaymentIntentFailedEvent(
          stripeCheckoutPaymentIntentResultFailedMock,
        );
        expect(result).toEqual(insertedPaymentFailedMock);
        expect(updatePaymentSpy).toHaveBeenCalledWith(
          insertedPaymentFailedMock.id,
          failedPaymentMock,
        );
        expect(insertPaymentReturningAllSpy).not.toHaveBeenCalled();
      },
    );
    it("should increase products stock if order was created", async () => {
      getOrderProductsByPaymentIdSpy.mockResolvedValueOnce([
        productIdAndQuantityMock,
      ]);
      getPaymentFromPaymentIntentSpy.mockReturnValueOnce(failedPaymentMock);
      getPaymentByIdSpy.mockResolvedValueOnce(undefined);
      insertPaymentReturningAllSpy.mockResolvedValueOnce([
        insertedPaymentFailedMock,
      ]);
      await getPaymentFromPaymentIntentFailedEvent(
        stripeCheckoutPaymentIntentResultFailedMock,
      );
      expect(increaseProductsStockSpy).toHaveBeenCalledWith([
        productIdAndQuantityMock,
      ]);
    });
  });
});
