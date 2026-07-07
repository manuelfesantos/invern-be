import { Hono } from "hono";
import type { HonoEnv } from "../../types/hono";
import { countryContext } from "../../middleware/country-context";
import { successResponse } from "@response-entity";
import { contextStore } from "@context-utils";
import config from "./config";
import products from "./products";
import collections from "./collections";
import cart from "./cart";
import checkout from "./checkout";
import orders from "./orders";
import user from "./user";
import oauth from "./oauth";

/**
 * Everything under `/public/countries/:countryCode`. `countryContext` resolves
 * the country for the whole subtree; the protected sub-resources apply
 * `authContext` themselves.
 */
const country = new Hono<HonoEnv>();

country.use("*", countryContext);

country.get("/", () =>
  successResponse.OK(
    "Success getting country by code",
    contextStore.context.country,
  ),
);

country.route("/config", config);
country.route("/products", products);
country.route("/collections", collections);
country.route("/cart", cart);
country.route("/checkout", checkout);
country.route("/orders", orders);
country.route("/user", user);
country.route("/oauth", oauth);

export default country;
