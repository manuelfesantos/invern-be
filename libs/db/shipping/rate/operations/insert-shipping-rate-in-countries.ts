import type { BaseShippingRate, InsertShippingRate } from "@shipping-entity";
import { getRandomUUID } from "@crypto-utils";
import { runBatchOperation } from "@generics-db";
import {
  getInsertShippingRateAction,
  getInsertShippingRateInCountryAction,
} from "../actions";

export const insertShippingRateInCountries = async (
  shippingRate: InsertShippingRate,
  countryCodes: string[],
): Promise<BaseShippingRate | undefined> => {
  const shippingRateToInsert = {
    ...shippingRate,
    id: getRandomUUID(),
  };
  const [[newShippingRate]] = await runBatchOperation(
    getInsertShippingRateAction(shippingRateToInsert),
    ...countryCodes.map((countryCode) =>
      getInsertShippingRateInCountryAction(countryCode, shippingRateToInsert),
    ),
  );

  return newShippingRate;
};
