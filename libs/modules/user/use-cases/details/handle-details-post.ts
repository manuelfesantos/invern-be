import { UserDetails, userDetailsSchema } from "@user-entity";
import { encryptObject } from "@crypto-utils";

export const handleDetailsPost = async (
  body: unknown,
): Promise<{ userDetails: UserDetails; encryptedUserDetails: string }> => {
  const userDetails = userDetailsSchema.parse(body);
  const encryptedUserDetails = await encryptObject(userDetails);
  return { userDetails, encryptedUserDetails };
};
