import {
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
  paginationQuerySchema,
  toPaginatedResponse,
} from "@pagination-entity";

const parse = (input: unknown) => paginationQuerySchema.parse(input);
const parseFails = (input: unknown) =>
  paginationQuerySchema.safeParse(input).success === false;

describe("paginationQuerySchema", () => {
  it("applies defaults when values are omitted", () => {
    expect(parse({})).toEqual({
      page: DEFAULT_PAGE,
      pageSize: DEFAULT_PAGE_SIZE,
    });
    expect(parse({ page: undefined, pageSize: undefined })).toEqual({
      page: DEFAULT_PAGE,
      pageSize: DEFAULT_PAGE_SIZE,
    });
  });

  it("coerces string query params to numbers", () => {
    expect(parse({ page: "3", pageSize: "25" })).toEqual({
      page: 3,
      pageSize: 25,
    });
  });

  it("caps pageSize at the max and rejects above it", () => {
    expect(parse({ pageSize: String(MAX_PAGE_SIZE) }).pageSize).toBe(
      MAX_PAGE_SIZE,
    );
    expect(parseFails({ pageSize: String(MAX_PAGE_SIZE + 1) })).toBe(true);
  });

  it("rejects page/pageSize below 1", () => {
    expect(parseFails({ page: "0" })).toBe(true);
    expect(parseFails({ pageSize: "0" })).toBe(true);
    expect(parseFails({ page: "-1" })).toBe(true);
  });

  it("rejects non-numeric and non-integer input", () => {
    expect(parseFails({ page: "abc" })).toBe(true);
    expect(parseFails({ page: "1.5" })).toBe(true);
    expect(parseFails({ page: null })).toBe(true); // null coerces to 0 → < 1
  });
});

describe("toPaginatedResponse", () => {
  it("builds the { data, page, pageSize, total } envelope", () => {
    const data = [{ id: "a" }, { id: "b" }];
    expect(toPaginatedResponse(data, { page: 2, pageSize: 10, total: 42 })).toEqual(
      { data, page: 2, pageSize: 10, total: 42 },
    );
  });
});
