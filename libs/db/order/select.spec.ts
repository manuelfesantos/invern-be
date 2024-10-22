import * as DB from "@db";
import { getOrderByClientId, getOrderById, getOrdersByUserId } from "./select";

const foundOrder = {
  clientOrderId: "1",
  orderId: "1",
  createdAt: "1",
  userId: "1",
  paymentId: "1",
  addressId: "1",
  address: {
    addressId: "1",
    line1: "1",
    line2: "1",
    city: "1",
    postalCode: "1",
    country: {
      code: "PT",
      name: "1",
      taxes: [
        {
          taxId: "1",
          name: "1",
          amount: 1,
        },
      ],
      countriesToCurrencies: [
        {
          currency: {
            code: "1",
            name: "1",
            symbol: "1",
          },
        },
      ],
    },
  },
  payment: {
    paymentId: "1",
    createdAt: "1",
    type: "card",
    state: "succeeded",
    amount: 1,
  },
  productsToOrders: [
    {
      quantity: 1,
      product: {
        productId: "1",
        productName: "1",
        description: "1",
        stock: 1,
        priceInCents: 1,
        images: [
          {
            url: "1",
            alt: "1",
          },
        ],
      },
    },
  ],
};

const returnedOrder = {
  clientOrderId: "1",
  createdAt: "1",
  orderId: "1",
  products: [
    {
      quantity: 1,
      productId: "1",
      productName: "1",
      stock: 1,
      priceInCents: 1,
      images: [
        {
          url: "1",
          alt: "1",
        },
      ],
    },
  ],
  payment: {
    createdAt: "1",
    type: "card",
    state: "succeeded",
    amount: 1,
  },
  address: {
    addressId: "1",
    line1: "1",
    line2: "1",
    city: "1",
    postalCode: "1",
    country: {
      code: "PT",
      name: "1",
      taxes: [
        {
          taxId: "1",
          name: "1",
          amount: 1,
        },
      ],
      currencies: [
        {
          code: "1",
          name: "1",
          symbol: "1",
        },
      ],
    },
  },
};

jest.mock("@db", () => ({
  db: jest.fn().mockReturnValue({
    query: {
      ordersTable: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
      },
    },
  }),
}));

const ONE_ELEMENT = 1;
const FIRST_ELEMENT = 0;

describe("get", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  describe("orders by user id", () => {
    const findManySpy = jest.spyOn(DB.db().query.ordersTable, "findMany");
    it("should get orders by user id", async () => {
      findManySpy.mockResolvedValueOnce([foundOrder]);
      const userId = "1";
      const result = await getOrdersByUserId(userId);
      expect(findManySpy).toHaveBeenCalled();
      expect(result).toHaveLength(ONE_ELEMENT);
      expect(result[FIRST_ELEMENT]).toEqual({
        ...returnedOrder,
        orderId: undefined,
      });
    });
  });

  describe("order by id", () => {
    const findFirstSpy = jest.spyOn(DB.db().query.ordersTable, "findFirst");
    it("should get order by id", async () => {
      findFirstSpy.mockResolvedValueOnce(foundOrder);
      const orderId = "1";
      const result = await getOrderById(orderId);
      expect(findFirstSpy).toHaveBeenCalled();
      expect(result).toEqual(returnedOrder);
    });
  });
  describe("order by client order id", () => {
    const findFirstSpy = jest.spyOn(DB.db().query.ordersTable, "findFirst");
    it("should get order by client order id", async () => {
      findFirstSpy.mockResolvedValueOnce(foundOrder);
      const clientOrderId = "1";
      const result = await getOrderByClientId(clientOrderId);
      expect(findFirstSpy).toHaveBeenCalled();
      expect(result).toEqual({ ...returnedOrder, orderId: undefined });
    });
  });
});
