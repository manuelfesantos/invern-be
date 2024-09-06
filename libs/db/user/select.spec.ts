import { getUserByEmail, getUserById, getUserVersionById } from "./select";
import * as DB from "@db";
import { errors } from "@error-handling-utils";

const userFromDbWithCart = {
  userId: "167tu3uY9Kc94huumc197K",
  email: "email@example.com",
  version: 0,
  firstName: "firstName",
  lastName: "lastName",
  password: "hashedPassword",
  role: "ADMIN" as const,
  cartId: "gsreRxngDngQV5eJFjfGD5",
  cart: {
    cartId: "gsreRxngDngQV5eJFjfGD5",
    productsToCarts: [
      {
        product: {
          productId: "productId",
          images: [],
          productName: "productName",
          stock: 1,
          priceInCents: 1,
        },
        quantity: 1,
      },
    ],
  },
};

const userFromDbWithoutCart = {
  userId: "167tu3uY9Kc94huumc197K",
  email: "email@example.com",
  version: 0,
  firstName: "firstName",
  lastName: "lastName",
  password: "hashedPassword",
  role: "ADMIN" as const,
  cartId: "gsreRxngDngQV5eJFjfGD5",
};

const userFromDbWithoutVersion = {
  userId: "167tu3uY9Kc94huumc197K",
  email: "email@example.com",
  firstName: "firstName",
  lastName: "lastName",
  password: "hashedPassword",
  role: "ADMIN" as const,
  version: null,
  cartId: "gsreRxngDngQV5eJFjfGD5",
};

const userWithCart = {
  userId: "167tu3uY9Kc94huumc197K",
  email: "email@example.com",
  version: 0,
  firstName: "firstName",
  lastName: "lastName",
  password: "hashedPassword",
  role: "ADMIN" as const,
  cart: {
    cartId: "gsreRxngDngQV5eJFjfGD5",
    products: [
      {
        productId: "productId",
        images: [],
        productName: "productName",
        stock: 1,
        priceInCents: 1,
        quantity: 1,
      },
    ],
  },
};

const userWithoutCart = {
  userId: "167tu3uY9Kc94huumc197K",
  email: "email@example.com",
  version: 0,
  firstName: "firstName",
  lastName: "lastName",
  password: "hashedPassword",
  role: "ADMIN" as const,
  cart: null,
};

jest.mock("@db", () => ({
  db: jest.fn().mockReturnValue({
    query: {
      usersTable: {
        findFirst: jest.fn(),
      },
    },
  }),
}));

const NO_USER_VERSION = 0;

describe("getUser", () => {
  const findFirstSpy = jest.spyOn(DB.db().query.usersTable, "findFirst");
  describe("by email", () => {
    it("should get user by email", async () => {
      findFirstSpy.mockResolvedValueOnce(userFromDbWithCart);
      const result = await getUserByEmail("email");
      expect(result).toEqual(userWithCart);
      expect(findFirstSpy).toHaveBeenCalled();
    });

    it("should return cart as null when user does not have a cart", async () => {
      findFirstSpy.mockResolvedValueOnce(userFromDbWithoutCart);
      const result = await getUserByEmail("email");
      expect(result).toEqual(userWithoutCart);
      expect(findFirstSpy).toHaveBeenCalled();
    });
    it("should return undefined if no user is found", async () => {
      findFirstSpy.mockResolvedValueOnce(undefined);
      const result = await getUserByEmail("email");
      expect(result).toBeUndefined();
      expect(findFirstSpy).toHaveBeenCalled();
    });
  });
  describe("by id", () => {
    it("should get user by id", async () => {
      findFirstSpy.mockResolvedValueOnce(userFromDbWithCart);
      const result = await getUserById("id");
      expect(result).toEqual(userWithCart);
      expect(findFirstSpy).toHaveBeenCalled();
    });
    it("should throw error if no user is found", async () => {
      findFirstSpy.mockResolvedValueOnce(undefined);
      await expect(async () => getUserById("id")).rejects.toThrow(
        errors.USER_NOT_FOUND(),
      );
      expect(findFirstSpy).toHaveBeenCalled();
    });
  });
  describe("version by id", () => {
    it("should get user version by id", async () => {
      findFirstSpy.mockResolvedValueOnce(userFromDbWithCart);
      const result = await getUserVersionById("id");
      expect(result).toEqual(userWithCart.version);
      expect(findFirstSpy).toHaveBeenCalled();
    });
    it("should return default version if user has no version", async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      findFirstSpy.mockResolvedValueOnce(userFromDbWithoutVersion as any);
      const result = await getUserVersionById("id");
      expect(result).toEqual(NO_USER_VERSION);
      expect(findFirstSpy).toHaveBeenCalled();
    });
    it("should throw error if no user is found", async () => {
      findFirstSpy.mockResolvedValueOnce(undefined);
      await expect(async () => getUserVersionById("id")).rejects.toThrow(
        errors.USER_NOT_FOUND(),
      );
      expect(findFirstSpy).toHaveBeenCalled();
    });
  });
});
