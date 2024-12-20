import { Country } from "@country-entity";

export const countriesMock: Country[] = [
  {
    name: "Portugal",
    code: "PT",
    currencies: [
      {
        code: "EUR",
        name: "Euro",
        symbol: "@",
      },
    ],
    taxes: [
      {
        taxId: "1",
        name: "VAT",
        rate: 0.15,
      },
    ],
  },
  {
    name: "Spain",
    code: "ES",
    currencies: [
      {
        code: "EUR",
        name: "Euro",
        symbol: "€",
      },
    ],
    taxes: [
      {
        taxId: "2",
        name: "VAT",
        rate: 0.15,
      },
    ],
  },
];
