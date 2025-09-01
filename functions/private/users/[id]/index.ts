import { requestHandler } from "@decorator-utils";
import { deleteUser, getUser } from "@user-module";
import { successResponse } from "@response-entity";

export const onRequestGet = requestHandler(async ({ params }) => {
  const userId = params.id as string;
  const user = await getUser(userId, false);
  return successResponse.OK("User fetched successfully", user);
});

export const onRequestDelete = requestHandler(async ({ params }) => {
  const userId = params.id as string;
  await deleteUser(userId);
  return successResponse.OK("User deleted successfully");
});
