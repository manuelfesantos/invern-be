import type { ShippingRate } from "@shipping-entity";
import { insertShippingRateSchema } from "@shipping-entity";
import {
  getSelectRateBandsByMethodAction,
  getSelectShippingRateByIdAction,
  getUpdateShippingRateAction,
} from "@shipping-db";
import { errors } from "@error-handling-utils";
import { assertNoBandOverlap, assertValidBand } from "./utils/band";
import { getShippingRateById } from "./get-shipping-rate-by-id";

const rateBodySchema = insertShippingRateSchema.omit({ shippingMethodId: true });

export const updateShippingRate = async (
  methodId: string,
  rateId: string,
  body: unknown,
): Promise<ShippingRate> => {
  const existing = await getSelectShippingRateByIdAction(rateId).run();
  if (!existing) {
    throw errors.SHIPPING_RATE_NOT_FOUND();
  }

  const rate = rateBodySchema.parse(body);
  assertValidBand(rate);
  const bands = await getSelectRateBandsByMethodAction(methodId).run();
  assertNoBandOverlap(bands, rate, rateId); // exclude the rate being updated

  const [updated] = await getUpdateShippingRateAction(rateId, rate).run();
  if (!updated) {
    throw errors.SHIPPING_RATE_NOT_FOUND();
  }
  return getShippingRateById(rateId);
};
