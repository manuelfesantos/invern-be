import { BaseUser, InsertUser } from "@user-entity";
import { db } from "@db";
import { usersTable } from "@schema";
import { eq, sql } from "drizzle-orm";
import { actionBuilder, Result } from "@generics-db";
import { hashPassword } from "@crypto-utils";

const ONE_VERSION = 1;

const updateUserQuery = (userId: string, changes: Partial<InsertUser>) =>
  db()
    .update(usersTable)
    .set(changes)
    .where(eq(usersTable.id, userId))
    .returning();

const mapUserFromUpdateQueryResult = (
  result: Result<typeof updateUserQuery>,
): BaseUser => {
  const [user] = result;
  return {
    ...user,
    version: user.version + ONE_VERSION,
  };
};

const preProcessUserUpdate = async (
  userId: string,
  changes: Partial<InsertUser>,
): Promise<[userId: string, changes: Partial<InsertUser>]> => {
  if (changes.password) {
    changes.password = await hashPassword(changes.password, userId);
  }
  return [userId, changes];
};

const incrementUserVersionQuery = (userId: string) =>
  db()
    .update(usersTable)
    .set({
      version: sql`version + 1`,
    })
    .where(eq(usersTable.id, userId))
    .returning();

const mapUserFromncrementVersionQueryResult = async (
  result: Result<typeof incrementUserVersionQuery>,
): Promise<BaseUser | undefined> => {
  const [user] = result;
  return user;
};

export const getUpdateUserAction = actionBuilder(
  updateUserQuery,
  mapUserFromUpdateQueryResult,
  preProcessUserUpdate,
);

export const getIncrementUserVersionAction = actionBuilder(
  incrementUserVersionQuery,
  mapUserFromncrementVersionQueryResult,
);
