import { runBatchOperation } from "@generics-db";
import {
  getDeleteRateCountriesAction,
  getInsertRateCountryAction,
} from "../actions";

/**
 * Replaces a rate's country set in one batch (delete-all then insert-each), so a
 * failure can't leave the rate with a half-updated set. The delete is always
 * present, so the batch is never empty (even when `countryCodes` is empty).
 */
export const setRateCountriesOperation = async (
  rateId: string,
  countryCodes: string[],
): Promise<void> => {
  await runBatchOperation(
    getDeleteRateCountriesAction(rateId),
    ...countryCodes.map((countryCode) =>
      getInsertRateCountryAction(rateId, countryCode),
    ),
  );
};
