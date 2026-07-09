import type { ShippingRate } from "@shipping-entity";
import * as z from "zod";
import {
  getSelectShippingRateByIdAction,
  setRateCountriesOperation,
} from "@shipping-db";
import { getSelectAllCountriesAction } from "@country-db";
import { errors } from "@error-handling-utils";
import { getShippingRateById } from "./get-shipping-rate-by-id";

const bodySchema = z.object({
  countryCodes: z.array(z.string().regex(/^[A-Z]{2}$/)),
});

/**
 * Replaces the full set of countries a rate applies to (multi-select "save the
 * whole list" semantics). Validates the rate exists and every code references a
 * real country; dedupes the input. Emptying the set is allowed but leaves the
 * rate unselectable at checkout (no destination matches) — intentional.
 */
export const setRateCountries = async (
  rateId: string,
  body: unknown,
): Promise<ShippingRate> => {
  const rate = await getSelectShippingRateByIdAction(rateId).run();
  if (!rate) {
    throw errors.SHIPPING_RATE_NOT_FOUND();
  }

  const { countryCodes } = bodySchema.parse(body);
  const deduped = [...new Set(countryCodes)];

  const validCodes = new Set(
    (await getSelectAllCountriesAction().run()).map((country) => country.code),
  );
  const unknown = deduped.filter((code) => !validCodes.has(code));
  if (unknown.length) {
    throw errors.UNKNOWN_COUNTRY_CODES(unknown.join(", "));
  }

  await setRateCountriesOperation(rateId, deduped);
  return getShippingRateById(rateId);
};
