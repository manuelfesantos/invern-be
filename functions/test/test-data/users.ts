import { hashPassword } from "@crypto-utils";
import { db } from "@db";
import { usersTable } from "@schema";
import { InsertUser } from "@user-entity";

const getUsersList = async (): Promise<(InsertUser & { userId: string })[]> => [
  {
    userId: "e0527f60-dab0-42d2-9dd7-952ed748382b",
    email: "manuelfesantos@gmail.com",
    firstName: "Manuel",
    lastName: "Santos",
    password: await hashPassword(
      "1234",
      "e0527f60-dab0-42d2-9dd7-952ed748382b",
    ),
  },
  {
    userId: "e0527f60-dab0-42d2-9dd7-952ed748382c",
    email: "mafperodrigues@gmail.com",
    firstName: "Mafalda",
    lastName: "Rodrigues",
    password: await hashPassword(
      "1234",
      "e0527f60-dab0-42d2-9dd7-952ed748382c",
    ),
  },
  {
    userId: "e0527f60-dab0-42d2-9dd7-952ed748382d",
    email: "invernspirit@gmail.com",
    firstName: "Invern",
    lastName: "Spirit",
    password: await hashPassword(
      "1234",
      "e0527f60-dab0-42d2-9dd7-952ed748382d",
    ),
  },
];

export const insertUsers = async (): Promise<void> => {
  await db()
    .insert(usersTable)
    .values(await getUsersList());
};
