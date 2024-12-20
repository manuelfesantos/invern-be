import { insertUser } from "./insert";
import * as DB from "@db";
import { usersTable } from "@schema";

jest.mock("@db", () => ({
  db: jest.fn().mockReturnValue({
    insert: jest.fn().mockReturnValue({
      values: jest.fn().mockReturnValue({
        returning: jest.fn().mockReturnValue([
          {
            userId: "1",
          },
        ]),
      }),
    }),
  }),
}));

jest.mock("@crypto-utils", () => ({
  getRandomUUID: jest.fn().mockReturnValue("1"),
  hashPassword: jest.fn().mockReturnValue("hashedPassword"),
}));

const ONE_ELEMENT = 1;
const FIRST_ELEMENT = 0;

describe("insertUser", () => {
  const valuesSpy = jest.spyOn(DB.db().insert(usersTable), "values");
  it("should insert user", async () => {
    const userInsert = {
      email: "email",
      password: "password",
      firstName: "name",
      lastName: "name",
      cartId: "cartId",
    };
    const result = await insertUser(userInsert);
    expect(valuesSpy).toHaveBeenCalledWith({
      ...userInsert,
      id: "1",
      password: "hashedPassword",
    });

    expect(result.length).toBe(ONE_ELEMENT);
    expect(result[FIRST_ELEMENT].userId).toBe("1");
  });
});
