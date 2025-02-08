import { UserDetails } from "@user-entity";
import { db } from "@db";
import { eq } from "drizzle-orm";
import { usersTable } from "@schema";

export const getUserDetailsById = async (
  userId: string,
): Promise<UserDetails | undefined> =>
  db().query.usersTable.findFirst({
    where: eq(usersTable.id, userId),
    columns: {
      email: true,
      firstName: true,
      lastName: true,
    },
  });
