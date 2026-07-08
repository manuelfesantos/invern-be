import {
  boolFilter,
  buildOrderBy,
  buildWhere,
  eqFilter,
  likeFilter,
  maxNumberFilter,
} from "@generics-db";
import { productsTable, usersTable } from "@schema";

const SORT_MAP = {
  name: productsTable.name,
  stock: productsTable.stock,
};

const FILTER_MAP = {
  collectionId: eqFilter(productsTable.collectionId),
  name: likeFilter(productsTable.name),
  maxStock: maxNumberFilter(productsTable.stock),
  isValidated: boolFilter(usersTable.isValidated),
};

describe("buildOrderBy", () => {
  it("returns undefined when no sort field is given", () => {
    expect(buildOrderBy(SORT_MAP, undefined, "asc")).toBeUndefined();
  });

  it("returns undefined for a field outside the sort map", () => {
    expect(buildOrderBy(SORT_MAP, "password", "asc")).toBeUndefined();
  });

  it("produces a single order clause for an allow-listed field", () => {
    expect(buildOrderBy(SORT_MAP, "stock", "asc")).toHaveLength(1);
    expect(buildOrderBy(SORT_MAP, "stock", "desc")).toHaveLength(1);
  });
});

describe("buildWhere", () => {
  it("returns undefined when no filter keys are present", () => {
    expect(buildWhere(FILTER_MAP, {})).toBeUndefined();
    expect(buildWhere(FILTER_MAP, { unrelated: "x" })).toBeUndefined();
  });

  it("returns undefined when present values are empty", () => {
    expect(buildWhere(FILTER_MAP, { name: "", collectionId: "" })).toBeUndefined();
  });

  it("builds a condition when a mapped filter has a value", () => {
    expect(buildWhere(FILTER_MAP, { name: "shirt" })).toBeDefined();
    expect(buildWhere(FILTER_MAP, { collectionId: "col-1" })).toBeDefined();
  });

  it("ANDs multiple filters together", () => {
    expect(
      buildWhere(FILTER_MAP, { name: "shirt", maxStock: "5" }),
    ).toBeDefined();
  });

  it("skips boolean filters whose value is not true/false", () => {
    expect(buildWhere(FILTER_MAP, { isValidated: "maybe" })).toBeUndefined();
    expect(buildWhere(FILTER_MAP, { isValidated: "true" })).toBeDefined();
    expect(buildWhere(FILTER_MAP, { isValidated: "false" })).toBeDefined();
  });

  it("skips numeric filters whose value is not a number", () => {
    expect(buildWhere(FILTER_MAP, { maxStock: "lots" })).toBeUndefined();
    expect(buildWhere(FILTER_MAP, { maxStock: "0" })).toBeDefined();
  });
});
