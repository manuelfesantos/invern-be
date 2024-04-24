import { decode, encode } from "@utils/encoding";
import { z } from "zod";
const bodySchema = z.object({
  password: z.string(),
  username: z.string(),
});
export const onRequest: PagesFunction = async (context) => {
  const { request } = context;
  if (request.method !== "POST") {
    return Response.json({ error: "method not allowed", status: 405 });
  }
  try {
    const body = bodySchema.parse(await request.json());
    if (!body.password) {
      return Response.json({ error: "password not provided", status: 400 });
    }
    const keyPair = (await crypto.subtle.generateKey(
      {
        name: "AES-GCM",
        length: 256,
      },
      true,
      ["encrypt", "decrypt"],
    )) as CryptoKey;
    const iv = encode("ola");
    const encodedBody = encode(body.password);
    const encryptedBody = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv },
      keyPair,
      encode(body.password),
    );

    const decryptedBody = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: iv },
      keyPair,
      encryptedBody,
    );
    const hashedPassword = decode(decryptedBody);
    return new Response(JSON.stringify(hashedPassword));
  } catch (error) {
    return Response.json({ error, status: 500 });
  }
};
