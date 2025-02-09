import { BaseShippingMethod, BaseShippingRate } from "@shipping-entity";
import { getRandomUUID } from "@crypto-utils";
import { CountryEnum, CountryEnumType } from "@country-entity";
import {
  shippingMethodsTable,
  shippingRatesTable,
  shippingRatesToCountriesTable,
} from "@schema";
// eslint-disable-next-line import/no-restricted-paths
import { db } from "@db";

const FIRST_INDEX = 0;

const getShippingMethods = (): BaseShippingMethod[] => [
  {
    id: getRandomUUID(),
    name: "Batch Logistics",
  },
];

const getPortugalShippingRates = (methodId: string): BaseShippingRate[] => [
  {
    id: getRandomUUID(),
    shippingMethodId: methodId,
    priceInCents: 406,
    minWeight: 0,
    deliveryTime: 1,
    maxWeight: 3000,
  },
  {
    id: getRandomUUID(),
    shippingMethodId: methodId,
    priceInCents: 426,
    minWeight: 3000,
    deliveryTime: 1,
    maxWeight: 5000,
  },
  {
    id: getRandomUUID(),
    shippingMethodId: methodId,
    priceInCents: 449,
    minWeight: 5000,
    deliveryTime: 1,
    maxWeight: 10000,
  },
  {
    id: getRandomUUID(),
    shippingMethodId: methodId,
    priceInCents: 572,
    minWeight: 10000,
    deliveryTime: 1,
    maxWeight: 15000,
  },
  {
    id: getRandomUUID(),
    shippingMethodId: methodId,
    priceInCents: 606,
    minWeight: 15000,
    deliveryTime: 1,
    maxWeight: 20000,
  },
  {
    id: getRandomUUID(),
    shippingMethodId: methodId,
    priceInCents: 736,
    minWeight: 20000,
    deliveryTime: 1,
    maxWeight: 25000,
  },
  {
    id: getRandomUUID(),
    shippingMethodId: methodId,
    priceInCents: 775,
    minWeight: 25000,
    deliveryTime: 1,
    maxWeight: 30000,
  },
];

const getSpainShippingRates = (methodId: string): BaseShippingRate[] => [
  {
    id: getRandomUUID(),
    shippingMethodId: methodId,
    priceInCents: 608,
    minWeight: 0,
    deliveryTime: 2,
    maxWeight: 1000,
  },
  {
    id: getRandomUUID(),
    shippingMethodId: methodId,
    priceInCents: 691,
    minWeight: 1000,
    deliveryTime: 2,
    maxWeight: 5000,
  },
  {
    id: getRandomUUID(),
    shippingMethodId: methodId,
    priceInCents: 818,
    minWeight: 5000,
    deliveryTime: 2,
    maxWeight: 10000,
  },
  {
    id: getRandomUUID(),
    shippingMethodId: methodId,
    priceInCents: 1186,
    minWeight: 10000,
    deliveryTime: 2,
    maxWeight: 15000,
  },
  {
    id: getRandomUUID(),
    shippingMethodId: methodId,
    priceInCents: 1494,
    minWeight: 15000,
    deliveryTime: 2,
    maxWeight: 20000,
  },
];

const getRatesToCountries = (
  shippingRates: BaseShippingRate[] = [],
  country: CountryEnumType,
): {
  shippingRateId: string;
  countryCode: string;
}[] =>
  shippingRates.map(({ id }) => ({
    shippingRateId: id,
    countryCode: country,
  }));

export const insertShippingMethods = async (): Promise<void> => {
  const shippingMethods = getShippingMethods();
  await Promise.all(
    shippingMethods.map(async (shippingMethod) => {
      await db().insert(shippingMethodsTable).values(shippingMethod).execute();
    }),
  );
  const portugalShippingRates = getPortugalShippingRates(
    shippingMethods[FIRST_INDEX].id,
  );
  const spainShippingRates = getSpainShippingRates(
    shippingMethods[FIRST_INDEX].id,
  );
  await Promise.all(
    [...portugalShippingRates, ...spainShippingRates].map(
      async (shippingRate) => {
        await db().insert(shippingRatesTable).values(shippingRate).execute();
      },
    ),
  );
  const portugalRatesToCountries = getRatesToCountries(
    portugalShippingRates,
    CountryEnum.PT,
  );
  const spainRatesToCountries = getRatesToCountries(
    spainShippingRates,
    CountryEnum.ES,
  );
  await Promise.all(
    [...portugalRatesToCountries, ...spainRatesToCountries].map(
      async (rateToCountry) => {
        await db()
          .insert(shippingRatesToCountriesTable)
          .values(rateToCountry)
          .execute();
      },
    ),
  );
};
