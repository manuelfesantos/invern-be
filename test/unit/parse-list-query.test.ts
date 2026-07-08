import {
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
  parseListQuery,
} from "@pagination-entity";

const SORTABLE = ["name", "stock", "createdAt"] as const;
const parse = (input: unknown) => parseListQuery(SORTABLE, input);

describe("parseListQuery", () => {
  it("applies pagination + sortOrder defaults, no sort by default", () => {
    expect(parse({})).toEqual({
      page: DEFAULT_PAGE,
      pageSize: DEFAULT_PAGE_SIZE,
      sortOrder: "asc",
    });
    expect(parse(undefined).sortBy).toBeUndefined();
  });

  it("accepts an allow-listed sort field with a direction", () => {
    expect(parse({ sortBy: "stock", sortOrder: "desc" })).toMatchObject({
      sortBy: "stock",
      sortOrder: "desc",
    });
  });

  it("rejects a sort field that is not allow-listed (→ 400)", () => {
    expect(() => parse({ sortBy: "password" })).toThrow();
    expect(() => parse({ sortBy: "id" })).toThrow();
  });

  it("rejects an invalid sort direction", () => {
    expect(() => parse({ sortBy: "name", sortOrder: "sideways" })).toThrow();
  });

  it("still enforces pagination bounds", () => {
    expect(() => parse({ pageSize: String(MAX_PAGE_SIZE + 1) })).toThrow();
    expect(() => parse({ page: "0" })).toThrow();
  });

  it("ignores unknown query keys (they are not part of the parsed sort)", () => {
    const result = parse({ name: "shirt", junk: "x", sortBy: "name" });
    expect(result).toEqual({
      page: DEFAULT_PAGE,
      pageSize: DEFAULT_PAGE_SIZE,
      sortBy: "name",
      sortOrder: "asc",
    });
  });
});
