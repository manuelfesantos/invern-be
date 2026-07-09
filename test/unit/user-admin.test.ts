/**
 * Admin user actions: the last-admin guard (can't demote/disable/delete the
 * final admin), session revocation on role-change/disable, and the safe
 * projection (password/google id never returned). DB actions and the KV
 * auth-secret revoke are mocked.
 */
jest.mock("@user-db", () => ({
  __esModule: true,
  ...jest.requireActual("@user-db"),
  getSelectUserByIdAction: jest.fn(),
  getUpdateUserAction: jest.fn(),
  getSelectAdminCountAction: jest.fn(),
  getDeleteUserAction: jest.fn(),
}));
jest.mock("@cart-db", () => ({
  __esModule: true,
  ...jest.requireActual("@cart-db"),
  getDeleteCartAction: jest.fn(),
}));
jest.mock("@kv-adapter", () => ({
  __esModule: true,
  ...jest.requireActual("@kv-adapter"),
  deleteAuthSecret: jest.fn(),
}));

import {
  getSelectUserByIdAction,
  getUpdateUserAction,
  getSelectAdminCountAction,
  getDeleteUserAction,
} from "@user-db";
import { getDeleteCartAction } from "@cart-db";
import { deleteAuthSecret } from "@kv-adapter";
import { updateUserAdmin } from "../../libs/modules/user/use-cases/admin/update-user-admin";
import { adminDeleteUser } from "../../libs/modules/user/use-cases/admin/admin-delete-user";
import { getAdminUserDetail } from "../../libs/modules/user/use-cases/admin/get-admin-user-detail";

const selById = getSelectUserByIdAction as unknown as jest.Mock;
const upd = getUpdateUserAction as unknown as jest.Mock;
const adminCount = getSelectAdminCountAction as unknown as jest.Mock;
const delUser = getDeleteUserAction as unknown as jest.Mock;
const delCart = getDeleteCartAction as unknown as jest.Mock;
const revoke = deleteAuthSecret as unknown as jest.Mock;

const actionReturning = (value: unknown) => ({
  run: () => Promise.resolve(value),
});

const userWith = (over: Record<string, unknown> = {}) => ({
  id: "11111111-1111-4111-8111-111111111111",
  email: "u@example.com",
  firstName: "U",
  lastName: null,
  role: "USER",
  isOauth: false,
  isValidated: true,
  disabled: false,
  password: "SECRET-HASH",
  googleUserId: "GOOGLE-ID",
  version: 1,
  createdAt: "2026-01-01T00:00:00.000",
  lastModifiedAt: "2026-01-01T00:00:00.000",
  cart: null,
  address: null,
  ...over,
});

beforeEach(() => {
  selById.mockReset().mockReturnValue(actionReturning(userWith()));
  upd.mockReset().mockReturnValue(actionReturning([userWith()]));
  adminCount.mockReset().mockReturnValue(actionReturning(2));
  delUser.mockReset().mockReturnValue(actionReturning({ cartId: "c1" }));
  delCart.mockReset().mockReturnValue(actionReturning(undefined));
  revoke.mockReset().mockResolvedValue(undefined);
});

describe("getAdminUserDetail (safe projection)", () => {
  it("never returns the password hash or google id", async () => {
    const detail = (await getAdminUserDetail("id")) as Record<string, unknown>;
    expect(detail.password).toBeUndefined();
    expect(detail.googleUserId).toBeUndefined();
    expect(detail.role).toBe("USER"); // role IS included (unlike userDTO)
  });
});

describe("updateUserAdmin", () => {
  it("promotes USER→ADMIN and revokes the session", async () => {
    await updateUserAdmin("id", { role: "ADMIN" });
    expect(upd).toHaveBeenCalledWith("id", { role: "ADMIN" });
    expect(revoke).toHaveBeenCalledWith("id");
  });

  it("marks validated without revoking the session (no role/disable change)", async () => {
    await updateUserAdmin("id", { isValidated: true });
    expect(upd).toHaveBeenCalledWith("id", { isValidated: true });
    expect(revoke).not.toHaveBeenCalled();
  });

  it("blocks demoting the last admin (no write)", async () => {
    selById.mockReturnValue(actionReturning(userWith({ role: "ADMIN" })));
    adminCount.mockReturnValue(actionReturning(1));
    await expect(
      updateUserAdmin("id", { role: "USER" }),
    ).rejects.toThrow();
    expect(upd).not.toHaveBeenCalled();
    expect(revoke).not.toHaveBeenCalled();
  });

  it("allows demoting an admin when others remain, and revokes", async () => {
    selById.mockReturnValue(actionReturning(userWith({ role: "ADMIN" })));
    adminCount.mockReturnValue(actionReturning(2));
    await updateUserAdmin("id", { role: "USER" });
    expect(upd).toHaveBeenCalledWith("id", { role: "USER" });
    expect(revoke).toHaveBeenCalledWith("id");
  });

  it("blocks disabling the last admin", async () => {
    selById.mockReturnValue(actionReturning(userWith({ role: "ADMIN" })));
    adminCount.mockReturnValue(actionReturning(1));
    await expect(
      updateUserAdmin("id", { disabled: true }),
    ).rejects.toThrow();
    expect(upd).not.toHaveBeenCalled();
  });

  it("404s when the user does not exist", async () => {
    selById.mockReturnValue(actionReturning(undefined));
    await expect(updateUserAdmin("id", { role: "ADMIN" })).rejects.toThrow();
  });
});

describe("adminDeleteUser", () => {
  it("deletes a normal user (+ cart) and revokes their session", async () => {
    await adminDeleteUser("id");
    expect(delUser).toHaveBeenCalledWith("id");
    expect(delCart).toHaveBeenCalledWith("c1");
    expect(revoke).toHaveBeenCalledWith("id");
  });

  it("blocks deleting the last admin", async () => {
    selById.mockReturnValue(actionReturning(userWith({ role: "ADMIN" })));
    adminCount.mockReturnValue(actionReturning(1));
    await expect(adminDeleteUser("id")).rejects.toThrow();
    expect(delUser).not.toHaveBeenCalled();
  });

  it("404s when the user does not exist", async () => {
    selById.mockReturnValue(actionReturning(undefined));
    await expect(adminDeleteUser("id")).rejects.toThrow();
    expect(delUser).not.toHaveBeenCalled();
  });
});
