import type { MiddlewareHandler } from "hono";
import * as z from "zod";
import { getCountryByCountryCode } from "@country-module";
import { contextStore } from "@context-utils";
import { countryCache } from "@cache-utils";
import type { Country } from "@country-entity";
import type { HonoEnv } from "../types/hono";

const countryCodeSchema = z.string().regex(/^[A-Z]{2}$/);

/**
 * Resolves `:countryCode` (validated, cached) onto the request context for
 * every `/public/countries/:countryCode/*` route. Auth credentials are layered
 * on separately by `authContext`, only for the protected sub-resources.
 */
export const countryContext: MiddlewareHandler<HonoEnv> = async (c, next) => {
  const countryCode = countryCodeSchema.parse(
    c.req.param("countryCode")?.toUpperCase(),
  );

  let country: Country;
  const cached = countryCache.get(countryCode);
  if (cached) {
    country = cached;
  } else {
    country = await getCountryByCountryCode(countryCode);
    countryCache.add(country);
  }

  contextStore.context.country = country;

  return next();
};
