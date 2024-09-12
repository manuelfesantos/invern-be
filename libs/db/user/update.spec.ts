import { incrementUserVersion, updateUser } from "./update";
import * as DB from "@db";
import { usersTable } from "@schema";
import { sql } from "drizzle-orm";

jest.mock("@db", () => ({
  db: jest.fn().mockReturnValue({
    update: jest.fn().mockReturnValue({
      set: jest.fn().mockReturnValue({
        where: jest.fn(),
      }),
    }),
  }),
}));

describe("update", () => {
  const setSpy = jest.spyOn(DB.db().update(usersTable), "set");
  describe("user", () => {
    it("should update user", async () => {
      const userId = "1";
      const changes = {
        firstName: "newFirstName",
      };
      const result = await updateUser(userId, changes);
      expect(setSpy).toHaveBeenCalledWith(changes);
      expect(result).toBeUndefined();
    });
  });

  describe("userVersion", () => {
    it("should increment userVersion", async () => {
      const userId = "1";
      const result = await incrementUserVersion(userId);
      expect(setSpy).toHaveBeenCalledWith({
        version: sql`version + 1`,
      });
      expect(result).toBeUndefined();
    });
  });
});
