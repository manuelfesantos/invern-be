import { logger } from "@logger-utils";
import { LoggerUseCaseEnum } from "@logger-entity";
import { acquireLock, getCacheKey, purgeCache, releaseLock } from "../utils";
import { stringifyObject } from "@string-utils";
import { z } from "zod";
import { ClientCountry, clientCountrySchema } from "@country-entity";
import { countriesHost } from "@http-utils";

const COUNTRY_LOCK_TTL = 3000;
const MAX_RETRIES = 3;
const countriesKey = "countries";
const countriesLockKey = "countries-lock";

let countriesBucket: R2Bucket | null = null;

const countryDataSchema = z.object({
  data: z.array(clientCountrySchema),
});

const init = (bucket: R2Bucket): void => {
  if (!countriesBucket) {
    countriesBucket = bucket;
  }
};

const getCountries = async (): Promise<
  { data: ClientCountry[] } | undefined
> => {
  if (!countriesBucket) {
    logger().error(
      "Countries bucket client not initialized",
      LoggerUseCaseEnum.GET_R2_COUNTRIES,
    );
    throw new Error("Countries bucket client not initialized");
  }

  const bucketObject = await countriesBucket.get(countriesKey);
  if (!bucketObject) {
    return undefined;
  }
  const countries = await bucketObject?.json();

  logger().info(
    "Got countries from bucket",
    LoggerUseCaseEnum.GET_R2_COUNTRIES,
    {
      countries,
    },
  );

  return countryDataSchema.parse(countries);
};

const updateCountries = async (countries: ClientCountry[]): Promise<void> => {
  if (!countriesBucket) {
    logger().error(
      "Countries bucket client not initialized",
      LoggerUseCaseEnum.PUT_R2_COUNTRIES,
    );
    throw new Error("Countries bucket client not initialized");
  }

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
      const cacheKey = getCacheKey(countriesHost(), countriesKey);
      if (cacheKey) {
        await purgeCache(cacheKey);
      }

      await releaseLock(countriesBucket, countriesLockKey);

      countriesUpdated = true;

      logger().info(
        "Updated countries in bucket",
        LoggerUseCaseEnum.PUT_R2_COUNTRIES,
        {
          countries,
        },
      );
    } else {
      logger().warn(
        "Failed to acquire lock, trying again",
        LoggerUseCaseEnum.PUT_R2_COUNTRIES,
        {
          countries,
        },
      );
    }
  }
};

const deleteCountries = async (): Promise<void> => {
  if (!countriesBucket) {
    logger().error(
      "Countries bucket client not initialized",
      LoggerUseCaseEnum.DELETE_R2_COUNTRIES,
    );
    throw new Error("Countries bucket client not initialized");
  }
  await countriesBucket.delete(countriesKey);

  logger().info(
    "Deleted countries from bucket",
    LoggerUseCaseEnum.DELETE_R2_COUNTRIES,
  );
};

export const countriesClient = {
  init,
  get: getCountries,
  delete: deleteCountries,
  update: updateCountries,
};
