import { calculateTaxAmount } from "../../libs/utils/extender/utils/calculate-tax-amount";
import { extendTaxes } from "../../libs/utils/extender/utils/extend-taxes";
import { getTaxedPrice } from "../../libs/utils/extender/utils/get-taxed-price";
import type { Tax } from "@tax-entity";

const vat = (rate: number): Tax => ({ name: "VAT", rate }) as Tax;

describe("tax / price math", () => {
  describe("calculateTaxAmount", () => {
    it("rounds up price * rate (cents)", () => {
      expect(calculateTaxAmount(500, vat(0.23))).toBe(115); // 500*0.23=115
      expect(calculateTaxAmount(499, vat(0.23))).toBe(Math.ceil(499 * 0.23)); // 115
      expect(calculateTaxAmount(100, vat(0.21))).toBe(21);
    });

    it("is zero when the rate is 0 or missing", () => {
      expect(calculateTaxAmount(500, vat(0))).toBe(0);
      expect(calculateTaxAmount(500, { name: "VAT" } as Tax)).toBe(0);
    });
  });

  describe("extendTaxes", () => {
    it("maps each tax to { name, rate, amount }", () => {
      expect(extendTaxes(1000, [vat(0.23), vat(0.1)])).toEqual([
        { name: "VAT", rate: 0.23, amount: 230 },
        { name: "VAT", rate: 0.1, amount: 100 },
      ]);
    });

    it("returns an empty array for no taxes", () => {
      expect(extendTaxes(1000, [])).toEqual([]);
    });
  });

  describe("getTaxedPrice", () => {
    it("sums (and ceils) the tax amounts", () => {
      expect(
        getTaxedPrice([
          { name: "VAT", rate: 0.23, amount: 115 },
          { name: "GST", rate: 0.05, amount: 25 },
        ]),
      ).toBe(140);
    });

    it("is zero for no taxes", () => {
      expect(getTaxedPrice([])).toBe(0);
    });
  });
});
