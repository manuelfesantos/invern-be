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
  "FORGOT_PASSWORD",
] as const;

const orderUseCasesSchema = [
  "GET_ORDER",
  "CREATE_ORDER",
  "UPDATE_ORDER",
  "GET_PAYMENT_INTENT",
] as const;

const r2BucketUseCasesSchema = [
  "GET_R2_STOCK",
  "PUT_R2_STOCK",
  "DELETE_R2_STOCK",
  "INIT_R2_STOCK_BUCKET",
  "PURGE_CACHE",
] as const;

const forgotPasswordSecretKvSchema = [
  "PUT_FORGOT_PASSWORD_SECRET",
  "GET_FORGOT_PASSWORD_SECRET",
  "DELETE_FORGOT_PASSWORD_SECRET",
] as const;

const responseUseCasesSchema = ["HTTP_RESPONSE"] as const;

const checkoutUseCasesSchema = [
  "CREATE_CHECKOUT_SESSION",
  "GET_PRODUCTS_FROM_METADATA",
  "INVALIDATE_CHECKOUT_SESSION",
  "HANDLE_CHECKOUT_SESSION",
  "CHECK_EXPIRED_SESSIONS",
] as const;

const oauthUseCasesSchema = ["OAUTH_GOOGLE_CALLBACK"];

const emailUseCasesSchema = ["SEND_EMAIL"] as const;

const loggerUseCasesSchema = z.enum([
  ...configUseCasesSchema,
  ...cartUseCasesSchema,
  ...productUseCasesSchema,
  ...userUseCasesSchema,
  ...orderUseCasesSchema,
  ...r2BucketUseCasesSchema,
  ...responseUseCasesSchema,
  ...checkoutUseCasesSchema,
  ...oauthUseCasesSchema,
  ...forgotPasswordSecretKvSchema,
  ...emailUseCasesSchema,
]);

export const LoggerUseCaseEnum = loggerUseCasesSchema.enum;

export type LoggerUseCase =
  (typeof LoggerUseCaseEnum)[keyof typeof LoggerUseCaseEnum];
