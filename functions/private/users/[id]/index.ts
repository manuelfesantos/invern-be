import { requestHandler } from "@decorator-utils";
import { deleteUser, getUser } from "@user-module";
import { successResponse } from "@response-entity";

const GET: PagesFunction = async ({ params }) => {
  const userId = params.id as string;
  const user = await getUser(userId, false);
  return successResponse.OK("User fetched successfully", user);
};

const DELETE: PagesFunction = async ({ params }) => {
  const userId = params.id as string;
  await deleteUser(userId);
  return successResponse.OK("User deleted successfully");
};

export const onRequest = requestHandler({ GET, DELETE });
