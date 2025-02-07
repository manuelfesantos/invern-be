import { Country } from "@country-entity";

export const countriesMock: Country[] = [
  {
    name: "Portugal",
    code: "PT",
    currency: {
      code: "EUR",
      name: "Euro",
      symbol: "@",
    },
    taxes: [
      {
        id: "1",
        name: "VAT",
        rate: 0.15,
      },
    ],
  },
  {
    name: "Spain",
    code: "ES",
    currency: {
      code: "EUR",
      name: "Euro",
      symbol: "€",
    },

    taxes: [
      {
        id: "2",
        name: "VAT",
        rate: 0.15,
      },
    ],
  },
];
