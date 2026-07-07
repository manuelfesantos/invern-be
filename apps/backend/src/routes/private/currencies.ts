import { Hono } from "hono";
import type { HonoEnv } from "../../types/hono";
import { getBodyFromRequest } from "@http-utils";
import { successResponse } from "@response-entity";
import {
  addCurrency,
  deleteCurrency,
  getAllCurrencies,
  getCurrencyByCode,
  updateCurrency,
} from "@currency-module";

const currencies = new Hono<HonoEnv>();

currencies.get("/", async () =>
  successResponse.OK(
    "Currencies fetched successfully",
    await getAllCurrencies(),
  ),
);

currencies.post("/", async (c) => {
  const currency = await addCurrency(await getBodyFromRequest(c.req.raw));
  return successResponse.OK("Currency created successfully", currency);
});

currencies.get("/:code", async (c) => {
  const currency = await getCurrencyByCode(c.req.param("code"));
  return successResponse.OK("Currency fetched successfully", currency);
});

currencies.put("/:code", async (c) => {
  const currency = await updateCurrency(
    c.req.param("code"),
    await getBodyFromRequest(c.req.raw),
  );
  return successResponse.OK("Currency updated successfully", currency);
});

currencies.delete("/:code", async (c) => {
  const currency = await deleteCurrency(c.req.param("code"));
  return successResponse.OK("Currency deleted successfully", currency);
});

export default currencies;
