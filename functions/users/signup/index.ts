import { z } from "zod";
import { initDb } from "@adapters/db";
import { userDTOSchema } from "@entities/user/user-entity";
import { createUser } from "@adapters/users/create-user";
import { HttpMethodEnum } from "@entities/http-request/http-request-entity";

interface Env {
  INVERN_DB: D1Database;
  IV: string;
}

const bodySchema = userDTOSchema.extend({
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

    const response = await createUser(userDTOSchema.parse(body), body.password);

    return Response.json(
      { message: "user created", response },
      { status: 201 },
    );
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
