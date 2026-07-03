/**
 * Smoke test (c): a use-case with a mocked DB action.
 * Proves the DB-action mocking pattern: mock the `@*-db` module the use-case
 * imports; return objects shaped `{ run: async () => ... }` (what `actionBuilder`
 * produces).
 */
import { getAllCollections } from "@collection-module";

const fakeCollections = [
  { id: "11111111-1111-4111-8111-111111111111", name: "Whisky", image: null },
  { id: "22222222-2222-4222-8222-222222222222", name: "Rum", image: null },
];

jest.mock("@collection-db", () => ({
  getSelectCollectionsAction: () => ({
    run: async () => fakeCollections,
  }),
}));

describe("getAllCollections (smoke)", () => {
  it("returns whatever the mocked select action resolves", async () => {
    const result = await getAllCollections();
    expect(result).toEqual(fakeCollections);
    expect(result).toHaveLength(2);
  });
});
