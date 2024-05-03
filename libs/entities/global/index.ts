import { z, ZodEffects, ZodNumber, ZodString } from "zod";

export const requiredStringSchema = (
  name: string,
): ZodEffects<ZodString, string, string> =>
  z
    .string({ required_error: `${name} is required` })
    .refine((value) => value.trim().length > 0, {
      message: `${name} is required`,
    });

export const emailSchema = (name: string): ZodString =>
  z
    .string({ required_error: `${name} is required` })
    .email({ message: `${name} is invalid` });

export const uuidSchema = (name: string): ZodString =>
  z
    .string({ required_error: `${name} is required` })
    .uuid({ message: `${name} is invalid` });

export const urlSchema = (name: string): ZodString =>
  z
    .string({ required_error: `${name} is required` })
    .url({ message: `${name} is invalid` });

export const positiveNumberSchema = (name: string): ZodNumber =>
  z
    .number({ required_error: `${name} is required` })
    .positive({ message: `${name} must be a positive number` });

export const positiveIntegerSchema = (name: string): ZodNumber =>
  z
    .number({ required_error: `${name} is required` })
    .int({ message: `${name} must be an integer` })
    .positive({ message: `${name} must be a positive number` });

export const integerSchema = (name: string): ZodNumber =>
  z
    .number({ required_error: `${name} is required` })
    .int({ message: `${name} must be an integer` });
