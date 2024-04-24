import { z } from "zod";
import { initDb } from "@adapters/db";
import { loginUser } from "@adapters/users/login-user";
import { HttpMethodEnum } from "@entities/http-request/http-request-entity";
interface Env {
  INVERN_DB: D1Database;
}

const bodySchema = z.object({
  email: z
    .string({ required_error: "email is required" })
    .email({ message: "Invalid email" }),
  password: z.string({ required_error: "password is required" }),
});

export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  if (request.method !== HttpMethodEnum.POST) {
    return Response.json({ error: "method not allowed" }, { status: 405 });
  }
  try {
    const body = bodySchema.parse(await request.json());

    initDb(env.INVERN_DB);

    const data = await loginUser(body.email, body.password);

    return Response.json({ message: "successfully logged in", data });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return Response.json({ error: error.issues }, { status: 400 });
    }
    return Response.json(
      { error: error.message },
      { status: error.code || 500 },
    );
  }
};
