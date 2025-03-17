import { logger } from "@logger-utils";
import { LoggerUseCaseEnum } from "@logger-entity";
import { acquireLock, getCacheKey, purgeCache, releaseLock } from "../utils";
import { stringifyObject } from "@string-utils";
import { z } from "zod";
import { ClientCountry, clientCountrySchema } from "@country-entity";
import { ENV } from "@env-utils";

const COUNTRY_LOCK_TTL = 3000;
const MAX_RETRIES = 3;
const countriesKey = "countries";
const countriesLockKey = "countries-lock";

let _countriesBucket: R2Bucket | null = null;

const countryDataSchema = z.object({
  data: z.array(clientCountrySchema),
});

const getCountriesBucket = (): R2Bucket => {
  if (!_countriesBucket) {
    _countriesBucket = ENV.COUNTRIES_BUCKET;
  }

  return _countriesBucket;
};

const getCountries = async (): Promise<
  { data: ClientCountry[] } | undefined
> => {
  const bucketObject = await getCountriesBucket().get(countriesKey);
  if (!bucketObject) {
    return undefined;
  }
  const countries = await bucketObject?.json();

  logger().info("Got countries from bucket", {
    useCase: LoggerUseCaseEnum.GET_R2_COUNTRIES,
    data: {
      countries,
    },
  });

  return countryDataSchema.parse(countries);
};

const updateCountries = async (countries: ClientCountry[]): Promise<void> => {
  const countriesBucket = getCountriesBucket();

  let countriesUpdated = false;
  let retries = 0;

  while (!countriesUpdated && retries < MAX_RETRIES) {
    retries++;
    const lock = await acquireLock(
      countriesBucket,
      countriesLockKey,
      COUNTRY_LOCK_TTL,
    );

    if (lock) {
      await countriesBucket.put(
        countriesKey,
        stringifyObject({ data: countries }),
      );
      const cacheKey = getCacheKey(ENV.COUNTRIES_HOST, countriesKey);
      if (cacheKey) {
        await purgeCache(cacheKey);
      }

      await releaseLock(countriesBucket, countriesLockKey);

      countriesUpdated = true;

      logger().info("Updated countries in bucket", {
        useCase: LoggerUseCaseEnum.PUT_R2_COUNTRIES,
        data: {
          countries,
        },
      });
    } else {
      logger().warn("Failed to acquire lock, trying again", {
        useCase: LoggerUseCaseEnum.PUT_R2_COUNTRIES,
        data: {
          countries,
        },
      });
    }
  }
};

const deleteCountries = async (): Promise<void> => {
  await getCountriesBucket().delete(countriesKey);

  logger().info("Deleted countries from bucket", {
    useCase: LoggerUseCaseEnum.DELETE_R2_COUNTRIES,
  });
};

export const countriesClient = {
  get: getCountries,
  delete: deleteCountries,
  update: updateCountries,
};
