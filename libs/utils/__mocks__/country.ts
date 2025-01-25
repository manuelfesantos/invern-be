import { Country } from "@country-entity";

export const countriesMock: Country[] = [
  {
    locale: "pt-PT",
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
    locale: "es-ES",
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
