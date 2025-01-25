import { z } from "zod";

const configUseCasesSchema = ["GET_CONFIG"] as const;

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
  "CREATE_ORDER",
  "UPDATE_ORDER",
  "GET_PAYMENT_INTENT",
] as const;

const r2BucketUseCasesSchema = [
  "GET_R2_STOCK",
  "GET_R2_COUNTRIES",
  "PUT_R2_STOCK",
  "PUT_R2_COUNTRIES",
  "DELETE_R2_STOCK",
  "DELETE_R2_COUNTRIES",
  "INIT_R2_STOCK_BUCKET",
  "INIT_R2_COUNTRIES_BUCKET",
  "PURGE_CACHE",
] as const;

const responseUseCasesSchema = ["HTTP_RESPONSE"] as const;

const checkoutUseCasesSchema = [
  "CREATE_CHECKOUT_SESSION",
  "GET_PRODUCTS_FROM_METADATA",
  "INVALIDATE_CHECKOUT_SESSION",
  "HANDLE_CHECKOUT_SESSION",
  "CHECK_EXPIRED_SESSIONS",
] as const;

const loggerUseCasesSchema = z.enum([
  ...configUseCasesSchema,
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
