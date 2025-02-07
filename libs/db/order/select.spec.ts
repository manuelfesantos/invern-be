import * as DB from "@db";
import { getOrderById, getOrderByStripeId, getOrdersByUserId } from "./select";

const foundOrder = {
  stripeId: "1",
  id: "1",
  createdAt: "1",
  userId: "1",
  paymentId: "1",
  addressId: "1",
  address: {
    id: "1",
    line1: "1",
    line2: "1",
    city: "1",
    postalCode: "1",
    country: {
      code: "PT",
      name: "1",
      taxes: [
        {
          id: "1",
          name: "1",
          rate: 1,
        },
      ],
      currency: {
        code: "1",
        name: "1",
        symbol: "1",
      },
    },
  },
  payment: {
    id: "1",
    createdAt: "1",
    type: "card",
    state: "succeeded",
    grossAmount: 2,
    netAmount: 1,
  },
  productsToOrders: [
    {
      quantity: 1,
      product: {
        id: "1",
        name: "1",
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
  snapshot: null,
};

const returnedOrder = {
  stripeId: "1",
  createdAt: "1",
  id: "1",
  products: [
    {
      quantity: 1,
      id: "1",
      name: "1",
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
    grossAmount: 2,
    netAmount: 1,
  },
  address: {
    id: "1",
    line1: "1",
    line2: "1",
    city: "1",
    postalCode: "1",
    country: {
      code: "PT",
      name: "1",
      taxes: [
        {
          id: "1",
          name: "1",
          rate: 1,
        },
      ],
      currency: {
        code: "1",
        name: "1",
        symbol: "1",
      },
    },
  },
  snapshot: null,
};

const returnedClientOrder = {
  id: "1",
  createdAt: "1",
  products: [
    {
      quantity: 1,
      id: "1",
      name: "1",
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
    netAmount: 1,
    grossAmount: 2,
  },
  address: {
    id: "1",
    line1: "1",
    line2: "1",
    city: "1",
    postalCode: "1",
    country: {
      code: "PT",
      name: "1",
      taxes: [
        {
          name: "1",
          rate: 1,
        },
      ],
      currency: {
        code: "1",
        name: "1",
        symbol: "1",
      },
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
        ...returnedClientOrder,
      });
    });
  });

  describe("order by id", () => {
    const findFirstSpy = jest.spyOn(DB.db().query.ordersTable, "findFirst");
    it("should get order by id", async () => {
      findFirstSpy.mockResolvedValueOnce(foundOrder);
      const orderId = "1";
      const result = await getOrderByStripeId(orderId);
      expect(findFirstSpy).toHaveBeenCalled();
      expect(result).toEqual(returnedOrder);
    });
  });
  describe("order by client order id", () => {
    const findFirstSpy = jest.spyOn(DB.db().query.ordersTable, "findFirst");
    it("should get order by client order id", async () => {
      findFirstSpy.mockResolvedValueOnce(foundOrder);
      const clientOrderId = "1";
      const result = await getOrderById(clientOrderId);
      expect(findFirstSpy).toHaveBeenCalled();
      expect(result).toEqual({ ...returnedClientOrder });
    });
  });
});
