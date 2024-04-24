import { z } from "zod";
import { encode } from "@utils/encoding";

interface Env {
  INVERN_DB: D1Database;
}

const bodySchema = z.object({
  username: z.string({ required_error: "username is required" }),
  password: z.string({ required_error: "password is required" }),
});

export const onRequest: PagesFunction<Env> = async (context) => {
  if (context.request.method !== "POST") {
    return Response.json({ error: "method not allowed", status: 405 });
  }
  try {
    const body = bodySchema.parse(await context.request.json());
    const keyPair = (await crypto.subtle.generateKey(
      {
        name: "AES-GCM",
      },
      true,
      ["encrypt", "decrypt"],
    )) as CryptoKey;
    const iv = encode("ola");
    const encryptedPassword = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv },
      keyPair,
      encode(body.password),
    );
    const db = context.env.INVERN_DB;
    await db
      .prepare("INSERT INTO users (username, password) VALUES ($1, $2)")
      .bind(body.username, encryptedPassword)
      .run();
    const user = await db
      .prepare("SELECT * FROM users WHERE username = $1")
      .bind(body.username)
      .first();
    return Response.json({ user });
  } catch (error) {
    return Response.json({ error, status: 400 });
  }
};
