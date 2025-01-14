import { z, ZodEffects, ZodNumber, ZodString } from "zod";
import { isValidUUID } from "@crypto-utils";

const ZERO_ELEMENTS = 0;

export const requiredStringSchema = (
  name: string,
): ZodEffects<ZodString, string, string> =>
  z
    .string({ required_error: `${name} is required` })
    .refine((value) => value.trim().length > ZERO_ELEMENTS, {
      message: `${name} is required`,
    });

export const emailSchema = (name: string): ZodString =>
  z
    .string({ required_error: `${name} is required` })
    .email({ message: `${name} is invalid` });

export const uuidSchema = (
  name: string,
): ZodEffects<ZodString, string, string> =>
  z
    .string({ required_error: `${name} is required` })
    .refine(isValidUUID, `${name} is an invalid uuid`);

export const urlSchema = (name: string): ZodString =>
  z
    .string({ required_error: `${name} is required` })
    .url({ message: `${name} is invalid` });

export const positiveNumberSchema = (name: string): ZodNumber =>
  z
    .number({ required_error: `${name} is required` })
    .nonnegative({ message: `${name} must not be a negative number` });

export const positiveIntegerSchema = (name: string): ZodNumber =>
  z
    .number({ required_error: `${name} is required` })
    .int({ message: `${name} must be an integer` })
    .nonnegative({ message: `${name} must be a positive number` });

export const integerSchema = (name: string): ZodNumber =>
  z
    .number({ required_error: `${name} is required` })
    .int({ message: `${name} must be an integer` });
