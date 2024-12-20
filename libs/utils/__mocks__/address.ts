import { Address } from "@address-entity";

export const addressMock: Address = {
  id: "1",
  city: "1",
  country: {
    taxes: [],
    currencies: [],
    code: "PT",
    name: "1",
  },
  line1: "1",
  line2: "1",
  postalCode: "1",
};

export const stripeAddressMock = {
  city: "1",
  country: "1",
  line1: "1",
  line2: "1",
  postalCode: "1",
};
