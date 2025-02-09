import { z, ZodEffects, ZodNumber, ZodString } from "zod";
// eslint-disable-next-line import/no-restricted-paths
import { isValidUUID } from "@crypto-utils";

const ZERO_ELEMENTS = 0;

const stringSchema = (name: string): ZodString =>
  z.string({
    required_error: `${name} is required`,
    invalid_type_error: `${name} should be a text`,
  });

export const requiredStringSchema = (
  name: string,
): ZodEffects<ZodString, string, string> =>
  stringSchema(name).refine((value) => value.trim().length > ZERO_ELEMENTS, {
    message: `${name} should not be a blank text`,
  });

export const emailSchema = (name: string): ZodString =>
  stringSchema(name).email({ message: `${name} is and invalid email` });

export const uuidSchema = (
  name: string,
): ZodEffects<ZodString, string, string> =>
  stringSchema(name).refine(isValidUUID, `${name} is an invalid uuid`);

export const urlSchema = (name: string): ZodString =>
  stringSchema(name).url({ message: `${name} is and invalid url` });

const numberSchema = (name: string): ZodNumber =>
  z.number({
    required_error: `${name} is required`,
    invalid_type_error: `${name} should be a number`,
  });

export const positiveNumberSchema = (name: string): ZodNumber =>
  numberSchema(name).nonnegative({
    message: `${name} must not be a negative number`,
  });

export const integerSchema = (name: string): ZodNumber =>
  numberSchema(name).int({ message: `${name} must be an integer` });

export const positiveIntegerSchema = (name: string): ZodNumber =>
  integerSchema(name).nonnegative({
    message: `${name} must be a positive number`,
  });

export const booleanSchema = (name: string): z.ZodBoolean =>
  z.boolean({
    required_error: `${name} is required`,
    invalid_type_error: `${name} should be either true or false`,
  });

export const requiredObjectSchema = <T extends z.ZodRawShape>(
  name: string,
  schema: T,
): z.ZodObject<T> =>
  z.object(schema, {
    required_error: `${name} is required`,
    invalid_type_error: `${name} should be an object`,
  });

const COUNTRY_CODE_LENGTH = 2;

export const countryCodeSchema = requiredStringSchema("Country code")
  .refine((value) => value.length === COUNTRY_CODE_LENGTH, {
    message: "Country code should be a 2 letter string",
  })
  .refine((value) => /^[A-Z]+$/.test(value), {
    message: "Country code should be uppercase",
  });
