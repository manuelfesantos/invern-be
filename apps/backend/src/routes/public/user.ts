import { Hono } from "hono";
import * as z from "zod";
import type { HonoEnv } from "../../types/hono";
import { authContext } from "../../middleware/auth-context";
import { protectedSuccessResponse, successResponse } from "@response-entity";
import {
  deleteCheckoutCookiesFromResponse,
  deleteCookieFromResponse,
  getBodyFromRequest,
} from "@http-utils";
import { CookieNameEnum } from "@http-entity";
import {
  deleteUser,
  getUser,
  login,
  logout,
  resendEmail,
  resetForgottenPassword,
  signup,
  submitEmail,
  updateUserEmail,
  updateUserPassword,
  updateUserPersonalInformation,
  validateCode,
  validateEmailSecret,
  validateUpdateEmailCode,
  validateUser,
} from "@user-module";

const user = new Hono<HonoEnv>();

// Every /user/* route resolves credentials first (anonymous or logged-in),
// matching the Pages `protectedEndpoints` gate.
user.use("*", authContext);

const emailSchema = z.object({ email: z.email() });
const verifyEmailSchema = z.object({
  code: z.string().nonempty(),
  email: z.email(),
});
const validateCodeSchema = z.object({
  code: z.string().nonempty(),
  email: z.email(),
});
const resetPasswordSchema = z.object({
  code: z.string().nonempty(),
  email: z.email(),
  password: z.string().nonempty(),
});

// ---- profile ----------------------------------------------------------------
user.get("/", async () =>
  successResponse.OK("Successfully got user", await getUser()),
);

user.delete("/", async () => {
  const { responseContext } = await deleteUser();
  const response = protectedSuccessResponse.OK(
    "success deleting user",
    undefined,
    undefined,
    responseContext,
  );
  deleteCheckoutCookiesFromResponse(response);
  return response;
});

// ---- auth -------------------------------------------------------------------
user.post("/signup", async (c) => {
  const { verificationCode } = await signup(
    await getBodyFromRequest(c.req.raw),
  );
  const response = protectedSuccessResponse.OK(
    "successfully signed up",
    verificationCode ? { verificationCode } : undefined,
  );
  deleteCookieFromResponse(response, CookieNameEnum.CART_ID);
  deleteCheckoutCookiesFromResponse(response);
  return response;
});

user.post("/signup/verify-email", async (c) => {
  const { code, email } = verifyEmailSchema.parse(
    await getBodyFromRequest(c.req.raw),
  );
  const secret = await validateEmailSecret(email, code);
  const {
    user: verifiedUser,
    cart,
    responseContext,
  } = await validateUser(email, secret);
  const response = protectedSuccessResponse.OK(
    "successfully signed up",
    { user: verifiedUser, cart },
    undefined,
    responseContext,
  );
  deleteCookieFromResponse(response, CookieNameEnum.CART_ID);
  deleteCheckoutCookiesFromResponse(response);
  return response;
});

user.post("/signup/resend-email", async (c) => {
  const { email } = emailSchema.parse(await getBodyFromRequest(c.req.raw));
  await resendEmail(email);
  return protectedSuccessResponse.OK("successfully signed up");
});

user.post("/login", async (c) => {
  const {
    user: loggedInUser,
    responseContext,
    cart,
  } = await login(await getBodyFromRequest(c.req.raw));
  const response = protectedSuccessResponse.OK(
    "successfully logged in",
    { user: loggedInUser, cart },
    undefined,
    responseContext,
  );
  deleteCookieFromResponse(response, CookieNameEnum.CART_ID);
  deleteCheckoutCookiesFromResponse(response);
  return response;
});

user.post("/logout", async () => {
  const { responseContext, cart } = await logout();
  const response = protectedSuccessResponse.OK(
    "successfully logged out",
    { cart },
    undefined,
    responseContext,
  );
  deleteCookieFromResponse(response, CookieNameEnum.REMEMBER);
  deleteCheckoutCookiesFromResponse(response);
  return response;
});

// ---- forgot password --------------------------------------------------------
user.post("/forgot-password/submit-email", async (c) => {
  const { email } = emailSchema.parse(await getBodyFromRequest(c.req.raw));
  await submitEmail(email);
  return protectedSuccessResponse.OK("Email sent successfully");
});

user.post("/forgot-password/validate-code", async (c) => {
  const { code, email } = validateCodeSchema.parse(
    await getBodyFromRequest(c.req.raw),
  );
  await validateCode(code, email);
  return protectedSuccessResponse.OK("Code validated successfully");
});

user.post("/forgot-password/reset", async (c) => {
  const { code, email, password } = resetPasswordSchema.parse(
    await getBodyFromRequest(c.req.raw),
  );
  await resetForgottenPassword(password, code, email);
  return protectedSuccessResponse.OK("Password reset successfully");
});

// ---- account updates --------------------------------------------------------
user.post("/update/password", async (c) => {
  const updated = await updateUserPassword(await getBodyFromRequest(c.req.raw));
  return protectedSuccessResponse.OK("successfully updated user", updated);
});

user.post("/update/personal-information", async (c) => {
  const updated = await updateUserPersonalInformation(
    await getBodyFromRequest(c.req.raw),
  );
  return protectedSuccessResponse.OK("successfully updated user", updated);
});

user.post("/update/email/submit", async (c) => {
  const updated = await updateUserEmail(await getBodyFromRequest(c.req.raw));
  return protectedSuccessResponse.OK("successfully updated user", updated);
});

user.post("/update/email/validate-code", async (c) => {
  const updated = await validateUpdateEmailCode(
    await getBodyFromRequest(c.req.raw),
  );
  return protectedSuccessResponse.OK(
    "successfully validated email code",
    updated,
  );
});

export default user;
