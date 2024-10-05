import { z } from "zod";

const productUseCasesSchema = [
  "GET_PRODUCT_DETAILS",
  "GET_PRODUCT_LIST",
  "ADD_PRODUCT",
  "REMOVE_PRODUCT",
  "UPDATE_PRODUCT",
  "RESERVE_PRODUCTS",
  "RELEASE_PRODUCTS",
] as const;

const cartUseCasesSchema = [
  "GET_CART",
  "ADD_TO_CART",
  "REMOVE_FROM_CART",
  "UPDATE_CART",
  "EMPTY_CART",
  "MERGE_CART",
  "VALIDATE_CART_ID",
] as const;

const userUseCasesSchema = [
  "GET_USER",
  "SIGNUP_USER",
  "LOGIN_USER",
  "LOGOUT_USER",
  "DELETE_USER",
  "UPDATE_USER_PASSWORD",
  "UPDATE_USER_EMAIL",
  "UPDATE_USER_NAME",
] as const;

const orderUseCasesSchema = [
  "GET_ORDER",
  "GREATE_ORDER",
  "UPDATE_ORDER",
] as const;

const r2BucketUseCasesSchema = [
  "GET_R2_STOCK",
  "PUT_R2_STOCK",
  "DELETE_R2_STOCK",
  "INIT_R2_BUCKET",
  "PURGE_STOCK_CACHE",
] as const;

const responseUseCasesSchema = ["HTTP_RESPONSE"] as const;

const checkoutUseCasesSchema = [
  "CREATE_CHECKOUT_SESSION",
  "GET_PRODUCTS_FROM_METADATA",
] as const;

const loggerUseCasesSchema = z.enum([
  ...cartUseCasesSchema,
  ...productUseCasesSchema,
  ...userUseCasesSchema,
  ...orderUseCasesSchema,
  ...r2BucketUseCasesSchema,
  ...responseUseCasesSchema,
  ...checkoutUseCasesSchema,
]);

export const LoggerUseCaseEnum = loggerUseCasesSchema.enum;

export type LoggerUseCase =
  (typeof LoggerUseCaseEnum)[keyof typeof LoggerUseCaseEnum];
