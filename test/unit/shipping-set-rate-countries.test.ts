/**
 * setRateCountries validation: dedupe, reject unknown country codes, require the
 * rate to exist. The DB actions + the transactional replace op are mocked so we
 * assert the use-case logic, not the database.
 */
jest.mock("@shipping-db", () => ({
  __esModule: true,
  ...jest.requireActual("@shipping-db"),
  getSelectShippingRateByIdAction: jest.fn(),
  setRateCountriesOperation: jest.fn(),
}));
jest.mock("@country-db", () => ({
  __esModule: true,
  ...jest.requireActual("@country-db"),
  getSelectAllCountriesAction: jest.fn(),
}));

import {
  getSelectShippingRateByIdAction,
  setRateCountriesOperation,
} from "@shipping-db";
import { getSelectAllCountriesAction } from "@country-db";
import { setRateCountries } from "../../libs/modules/shipping/use-cases/rate/admin/set-rate-countries";

const selRate = getSelectShippingRateByIdAction as unknown as jest.Mock;
const selCountries = getSelectAllCountriesAction as unknown as jest.Mock;
const setOp = setRateCountriesOperation as unknown as jest.Mock;

const actionReturning = (value: unknown) => ({
  run: () => Promise.resolve(value),
});
const RATE = {
  minWeight: 0,
  maxWeight: 1000,
  priceInCents: 500,
  deliveryTime: 2,
  countryCodes: [],
};

beforeEach(() => {
  selRate.mockReset().mockReturnValue(actionReturning(RATE));
  selCountries
    .mockReset()
    .mockReturnValue(actionReturning([{ code: "PT" }, { code: "ES" }]));
  setOp.mockReset().mockResolvedValue(undefined);
});

describe("setRateCountries", () => {
  it("dedupes and replaces with the valid codes", async () => {
    await setRateCountries("r1", { countryCodes: ["PT", "PT", "ES"] });
    expect(setOp).toHaveBeenCalledWith("r1", ["PT", "ES"]);
  });

  it("rejects unknown country codes and does not write", async () => {
    await expect(
      setRateCountries("r1", { countryCodes: ["PT", "XX"] }),
    ).rejects.toThrow();
    expect(setOp).not.toHaveBeenCalled();
  });

  it("allows an empty set (delete-all)", async () => {
    await setRateCountries("r1", { countryCodes: [] });
    expect(setOp).toHaveBeenCalledWith("r1", []);
  });

  it("throws when the rate does not exist", async () => {
    selRate.mockReturnValue(actionReturning(undefined));
    await expect(
      setRateCountries("missing", { countryCodes: ["PT"] }),
    ).rejects.toThrow();
    expect(setOp).not.toHaveBeenCalled();
  });
});
