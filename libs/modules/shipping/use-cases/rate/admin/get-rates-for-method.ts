import type { ShippingRate } from "@shipping-entity";
import { getSelectShippingRatesAction } from "@shipping-db";

/**
 * All rates for a method (unfiltered by weight). Method-scoped and bounded (a
 * handful of weight bands), so it is returned as a plain list — the pagination
 * envelope is for the unbounded top-level admin lists.
 */
export const getRatesForMethod = async (
  methodId: string,
): Promise<ShippingRate[]> => getSelectShippingRatesAction(methodId).run();
