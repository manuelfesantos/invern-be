import { UserDetails, userDetailsSchema } from "@user-entity";
import { encryptObject } from "@crypto-utils";
import { requiredObjectSchema } from "@global-entity";

const userDetailsPostPayloadSchema = requiredObjectSchema("Personal Details", {
  personalDetails: userDetailsSchema,
});

export const handleDetailsPost = async (
  body: unknown,
): Promise<{ userDetails: UserDetails; encryptedUserDetails: string }> => {
  const { personalDetails } = userDetailsPostPayloadSchema.parse(body);
  const encryptedUserDetails = await encryptObject(personalDetails);
  return { userDetails: personalDetails, encryptedUserDetails };
};
