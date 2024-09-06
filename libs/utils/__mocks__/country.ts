import { Country } from "@country-entity";

export const countriesMock: Country[] = [
  {
    name: "United States",
    code: "US",
    currencies: [
      {
        code: "USD",
        name: "US Dollar",
        symbol: "$",
      },
    ],
    taxes: [
      {
        name: "VAT",
        amount: 0.15,
        rate: 0.15,
      },
    ],
  },
  {
    name: "Canada",
    code: "CA",
    currencies: [
      {
        code: "CAD",
        name: "Canadian Dollar",
        symbol: "$",
      },
    ],
    taxes: [
      {
        name: "VAT",
        amount: 0.15,
        rate: 0.15,
      },
    ],
  },
  {
    name: "United Kingdom",
    code: "UK",
    currencies: [
      {
        code: "GBP",
        name: "Pound Sterling",
        symbol: "£",
      },
    ],
    taxes: [
      {
        name: "VAT",
        amount: 0.15,
        rate: 0.15,
      },
    ],
  },
];
