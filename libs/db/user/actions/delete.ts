import { actionBuilder, Result } from "@generics-db";
import { BaseUser, baseUserSchema } from "@user-entity";
import { db } from "@db";
import { usersTable } from "@schema";
import { and, eq, lt } from "drizzle-orm";
import { getPastDate, SIGNUP_EMAIL_EXPIRY } from "@timer-utils";

const FIRST_INDEX = 0;

const deleteUserQuery = (userId: string) =>
  db().delete(usersTable).where(eq(usersTable.id, userId)).returning();

const mapUserFromDeleteResult = (
  result: Result<typeof deleteUserQuery>,
): BaseUser => {
  const firstResult = result[FIRST_INDEX];
  return baseUserSchema.parse(firstResult);
};

const deleteExpiredUsersQuery = () =>
  db()
    .delete(usersTable)
    .where(
      and(
        eq(usersTable.isOauth, false),
        eq(usersTable.isValidated, false),
        lt(
          usersTable.createdAt,
          new Date(
            getPastDate(SIGNUP_EMAIL_EXPIRY, "milliseconds"),
          ).toISOString(),
        ),
      ),
    )
    .returning({ id: usersTable.id });

export const getDeleteUserAction = actionBuilder(
  deleteUserQuery,
  mapUserFromDeleteResult,
);

export const getDeleteExpiredUsersAction = actionBuilder(
  deleteExpiredUsersQuery,
);
