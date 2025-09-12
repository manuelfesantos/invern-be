import type { UserDetails } from "@user-entity";
import { userDetailsSchema } from "@user-entity";
import { encryptObject } from "@crypto-utils";
import { contextStore } from "@context-utils";
import { logCredentials } from "@logger-utils";
import * as z from "zod";

const userDetailsPostPayloadSchema = z.object({
  personalDetails: userDetailsSchema,
});

export const handleDetailsPost = async (
  body: unknown,
): Promise<{ userDetails: UserDetails; encryptedUserDetails: string }> => {
  const { userId, cartId } = contextStore.context;

  logCredentials(cartId, userId);

  const { personalDetails } = userDetailsPostPayloadSchema.parse(body);
  const encryptedUserDetails = await encryptObject(personalDetails);
  return { userDetails: personalDetails, encryptedUserDetails };
};
