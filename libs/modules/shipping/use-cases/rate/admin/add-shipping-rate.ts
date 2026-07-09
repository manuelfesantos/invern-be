import type { ShippingRate } from "@shipping-entity";
import { insertShippingRateSchema } from "@shipping-entity";
import { getRandomUUID } from "@crypto-utils";
import {
  getInsertShippingRateAction,
  getSelectRateBandsByMethodAction,
  getSelectShippingMethodAction,
} from "@shipping-db";
import { errors } from "@error-handling-utils";
import { assertNoBandOverlap, assertValidBand } from "./utils/band";
import { getShippingRateById } from "./get-shipping-rate-by-id";

/** Rate body without the parent method — it comes from the nested route path. */
const rateBodySchema = insertShippingRateSchema.omit({ shippingMethodId: true });

export const addShippingRate = async (
  methodId: string,
  body: unknown,
): Promise<ShippingRate> => {
  const method = await getSelectShippingMethodAction(methodId).run();
  if (!method) {
    throw errors.SHIPPING_METHOD_NOT_FOUND();
  }

  const rate = rateBodySchema.parse(body);
  assertValidBand(rate);
  const bands = await getSelectRateBandsByMethodAction(methodId).run();
  assertNoBandOverlap(bands, rate);

  const [inserted] = await getInsertShippingRateAction({
    id: getRandomUUID(),
    shippingMethodId: methodId,
    ...rate,
  }).run();
  if (!inserted) {
    throw new Error("Failed to create shipping rate");
  }
  return getShippingRateById(inserted.id);
};
