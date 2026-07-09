/**
 * Tax module: the Stripe-coupled CRUD. createTax must create a Stripe TaxRate
 * FIRST and key the D1 row by that Stripe id (checkout charges via it); rate is
 * a fraction stored as-is while Stripe gets the percentage; rate/country are
 * immutable (Stripe rule); delete archives the Stripe rate. Stripe adapter, tax
 * DB actions, and the country check are mocked.
 */
jest.mock("@stripe-adapter", () => ({
  __esModule: true,
  ...jest.requireActual("@stripe-adapter"),
  createStripeTax: jest.fn(),
  updateStripeTax: jest.fn(),
}));
jest.mock("@tax-db", () => ({
  __esModule: true,
  ...jest.requireActual("@tax-db"),
  getInsertTaxAction: jest.fn(),
  getUpdateTaxAction: jest.fn(),
  getDeleteTaxAction: jest.fn(),
  getSelectTaxByIdAction: jest.fn(),
}));
jest.mock("@country-db", () => ({
  __esModule: true,
  ...jest.requireActual("@country-db"),
  getSelectCountryByCodeAction: jest.fn(),
}));

import { createStripeTax, updateStripeTax } from "@stripe-adapter";
import {
  getInsertTaxAction,
  getUpdateTaxAction,
  getDeleteTaxAction,
  getSelectTaxByIdAction,
} from "@tax-db";
import { getSelectCountryByCodeAction } from "@country-db";
import { addTax } from "../../libs/modules/tax/use-cases/add-tax";
import { updateTax } from "../../libs/modules/tax/use-cases/update-tax";
import { deleteTax } from "../../libs/modules/tax/use-cases/delete-tax";
import { withTestContext } from "../harness";

const createStripe = createStripeTax as unknown as jest.Mock;
const updateStripe = updateStripeTax as unknown as jest.Mock;
const insert = getInsertTaxAction as unknown as jest.Mock;
const update = getUpdateTaxAction as unknown as jest.Mock;
const del = getDeleteTaxAction as unknown as jest.Mock;
const selById = getSelectTaxByIdAction as unknown as jest.Mock;
const selCountry = getSelectCountryByCodeAction as unknown as jest.Mock;

const STRIPE_ID = "txr_test123";
const TAX = {
  id: STRIPE_ID,
  name: "VAT",
  rate: 0.23,
  countryCode: "PT",
  createdAt: "2026-01-01T00:00:00.000",
  lastModifiedAt: "2026-01-01T00:00:00.000",
};

const actionReturning = (value: unknown) => ({
  run: () => Promise.resolve(value),
});

beforeEach(() => {
  createStripe.mockReset().mockResolvedValue({ id: STRIPE_ID });
  updateStripe.mockReset().mockResolvedValue({ id: STRIPE_ID });
  insert.mockReset().mockReturnValue(actionReturning({ taxId: STRIPE_ID }));
  update.mockReset().mockReturnValue(actionReturning(undefined));
  del.mockReset().mockReturnValue(actionReturning(undefined));
  selById.mockReset().mockReturnValue(actionReturning(TAX));
  selCountry.mockReset().mockReturnValue(actionReturning({ code: "PT" }));
});

describe("addTax", () => {
  it("creates a Stripe TaxRate first, then a D1 row keyed by the Stripe id", async () => {
    const result = await withTestContext(() =>
      addTax({ name: "VAT", countryCode: "PT", rate: 0.23 }),
    );

    // Stripe gets the percentage (23), not the fraction
    expect(createStripe).toHaveBeenCalledWith(
      expect.objectContaining({
        countryCode: "PT",
        name: "VAT",
        percentage: 23,
        inclusive: false,
      }),
    );
    // D1 row uses the Stripe id and stores the fraction
    expect(insert).toHaveBeenCalledWith({
      id: STRIPE_ID,
      name: "VAT",
      rate: 0.23,
      countryCode: "PT",
    });
    expect(result.id).toBe(STRIPE_ID);
  });

  it("rejects an unknown country (no Stripe write)", async () => {
    selCountry.mockReturnValue(actionReturning(undefined));
    await expect(
      withTestContext(() => addTax({ name: "VAT", countryCode: "ZZ", rate: 0.23 })),
    ).rejects.toThrow();
    expect(createStripe).not.toHaveBeenCalled();
  });

  it("rejects a rate outside 0..1 (a percentage like 23)", async () => {
    await expect(
      withTestContext(() => addTax({ name: "VAT", countryCode: "PT", rate: 23 })),
    ).rejects.toThrow();
    expect(createStripe).not.toHaveBeenCalled();
  });
});

describe("updateTax", () => {
  it("mirrors a name change to Stripe and D1", async () => {
    await withTestContext(() => updateTax(STRIPE_ID, { name: "IVA" }));
    expect(updateStripe).toHaveBeenCalledWith(STRIPE_ID, { name: "IVA" });
    expect(update).toHaveBeenCalledWith(STRIPE_ID, { name: "IVA" });
  });

  it("rejects changing the rate (immutable) before any write", async () => {
    await expect(
      withTestContext(() => updateTax(STRIPE_ID, { rate: 0.25 })),
    ).rejects.toThrow();
    expect(updateStripe).not.toHaveBeenCalled();
    expect(update).not.toHaveBeenCalled();
  });

  it("rejects changing the countryCode (immutable)", async () => {
    await expect(
      withTestContext(() => updateTax(STRIPE_ID, { countryCode: "ES" })),
    ).rejects.toThrow();
    expect(updateStripe).not.toHaveBeenCalled();
  });

  it("404s when the tax does not exist", async () => {
    selById.mockReturnValue(actionReturning(undefined));
    await expect(
      withTestContext(() => updateTax(STRIPE_ID, { name: "IVA" })),
    ).rejects.toThrow();
  });
});

describe("deleteTax", () => {
  it("archives the Stripe rate (active:false) and deletes the D1 row", async () => {
    await withTestContext(() => deleteTax(STRIPE_ID));
    expect(updateStripe).toHaveBeenCalledWith(STRIPE_ID, { active: false });
    expect(del).toHaveBeenCalledWith(STRIPE_ID);
  });

  it("404s (no Stripe/D1 write) when the tax does not exist", async () => {
    selById.mockReturnValue(actionReturning(undefined));
    await expect(withTestContext(() => deleteTax(STRIPE_ID))).rejects.toThrow();
    expect(updateStripe).not.toHaveBeenCalled();
    expect(del).not.toHaveBeenCalled();
  });
});
