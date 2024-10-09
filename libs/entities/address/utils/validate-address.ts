import { InsertAddress } from "../address-entity";
import { errors } from "@error-handling-utils";

export const validateStripeAddress = (address: unknown): InsertAddress => {
  if (!address) throw errors.INVALID_ADDRESS("address is required");
  if (typeof address !== "object")
    throw errors.INVALID_ADDRESS("address must be an object");
  if (!("line1" in address))
    throw errors.INVALID_ADDRESS("address must have a line1");
  if (!address.line1) throw errors.INVALID_ADDRESS("address.line1 is required");
  if (typeof address.line1 !== "string")
    throw errors.INVALID_ADDRESS("address.line1 must be a string");
  if (!("line2" in address))
    throw errors.INVALID_ADDRESS("address must have a line2");
  if (!address.line2) throw errors.INVALID_ADDRESS("address.line2 is required");
  if (typeof address.line2 !== "string")
    throw errors.INVALID_ADDRESS("address.line2 must be a string");
  if (!("city" in address))
    throw errors.INVALID_ADDRESS("address must have a city");
  if (!address.city) throw errors.INVALID_ADDRESS("address.city is required");
  if (typeof address.city !== "string")
    throw errors.INVALID_ADDRESS("address.city must be a string");
  if (!("country" in address))
    throw errors.INVALID_ADDRESS("address must have a countries");
  if (!address.country)
    throw errors.INVALID_ADDRESS("address.countries is required");
  if (typeof address.country !== "string")
    throw errors.INVALID_ADDRESS("address.countries must be a string");
  if (!("postal_code" in address))
    throw errors.INVALID_ADDRESS("address must have a postal_code");
  if (!address.postal_code)
    throw errors.INVALID_ADDRESS("address.postal_code is required");
  if (typeof address.postal_code !== "string")
    throw errors.INVALID_ADDRESS("address.postal_code must be a string");
  return {
    line1: address.line1,
    line2: address.line2,
    city: address.city,
    country: address.country,
    postalCode: address.postal_code,
  };
};
