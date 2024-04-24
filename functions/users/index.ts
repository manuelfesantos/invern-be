import { userDTOSchema } from "@entities/user/user-entity";
import { initDb } from "@adapters/db";
import { z } from "zod";
import { HttpMethodEnum } from "@entities/http-request/http-request-entity";

interface Env {
  INVERN_DB: D1Database;
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  if (request.method !== HttpMethodEnum.PUT) {
    return Response.json({ error: "method not allowed" }, { status: 405 });
  }
  try {
    const body = userDTOSchema.parse(await request.json());
    const options = request.headers.get("OPTIONS")?.split("") ?? [];
    initDb(env.INVERN_DB);

    return Response.json({ body }, { status: 200 });
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
