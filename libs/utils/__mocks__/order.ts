import { ClientOrder, Order } from "@order-entity";
import { Tax } from "@tax-entity";

const FIRST_ELEMENT = 0;

export const clientOrdersMock: ClientOrder[] = [
  {
    id: "1",
    products: [],
    createdAt: "1",
    address: {
      id: "1",
      city: "1",
      country: {
        taxes: [] as Tax[],
        currency: {
          code: "EUR",
          name: "Euro",
          symbol: "€",
        },
        code: "PT",
        name: "1",
      },
      line1: "1",
      line2: "1",
      postalCode: "1",
    },
    payment: {
      grossAmount: 1,
      netAmount: 2,
      createdAt: "1",
      state: "succeeded",
      type: "card",
    },
  },
  {
    id: "2",
    products: [],
    createdAt: "2",
    address: {
      id: "2",
      city: "2",
      country: {
        taxes: [] as Tax[],
        currency: {
          code: "EUR",
          symbol: "€",
          name: "Euro",
        },
        code: "ES",
        name: "2",
      },
      line1: "2",
      line2: "2",
      postalCode: "2",
    },
    payment: {
      grossAmount: 3,
      netAmount: 4,
      createdAt: "2",
      state: "succeeded",
      type: "card",
    },
  },
];

export const ordersMock: Order[] = [
  {
    id: "1",
    stripeId: "1",
    products: [],
    createdAt: "1",
    address: {
      id: "1",
      city: "1",
      country: {
        taxes: [] as Tax[],
        currency: {
          symbol: "€",
          name: "Euro",
          code: "EUR",
        },
        code: "PT",
        name: "1",
      },
      line1: "1",
      line2: "1",
      postalCode: "1",
    },
    payment: {
      grossAmount: 1,
      netAmount: 2,
      createdAt: "1",
      state: "succeeded",
      type: "card",
    },
    snapshot: null,
  },
  {
    stripeId: "2",
    id: "2",
    products: [],
    createdAt: "2",
    address: {
      id: "2",
      city: "2",
      country: {
        taxes: [] as Tax[],
        currency: {
          code: "EUR",
          name: "Euro",
          symbol: "€",
        },
        code: "ES",
        name: "2",
      },
      line1: "2",
      line2: "2",
      postalCode: "2",
    },
    payment: {
      grossAmount: 2,
      netAmount: 3,
      createdAt: "2",
      state: "succeeded",
      type: "card",
    },
    snapshot: null,
  },
];

export const clientOrderMock = clientOrdersMock[FIRST_ELEMENT];
export const orderMock = ordersMock[FIRST_ELEMENT];
