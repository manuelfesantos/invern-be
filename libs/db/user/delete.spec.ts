import { deleteUser } from "./delete";

import * as DB from "@db";

jest.mock("@db", () => ({
  db: jest.fn().mockReturnValue({
    delete: jest.fn().mockReturnValue({
      where: jest.fn(),
    }),
  }),
}));

describe("deleteUser", () => {
  const deleteSpy = jest.spyOn(DB.db(), "delete");
  beforeEach(() => {
    deleteSpy.mockClear();
  });
  it("should delete user", async () => {
    const userId = "1";
    await deleteUser(userId);
    expect(deleteSpy).toHaveBeenCalled();
  });
});
