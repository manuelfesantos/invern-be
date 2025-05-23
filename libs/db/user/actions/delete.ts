import { actionBuilder, Result } from "@generics-db";
import { BaseUser, baseUserSchema } from "@user-entity";
import { db } from "@db";
import { usersTable } from "@schema";
import { eq } from "drizzle-orm";

const FIRST_INDEX = 0;

const deleteUserQuery = (userId: string) =>
  db().delete(usersTable).where(eq(usersTable.id, userId)).returning();

const mapUserFromDeleteResult = (
  result: Result<typeof deleteUserQuery>,
): BaseUser => {
  const firstResult = result[FIRST_INDEX];
  return baseUserSchema.parse(firstResult);
};

export const getDeleteUserAction = actionBuilder(
  deleteUserQuery,
  mapUserFromDeleteResult,
);
