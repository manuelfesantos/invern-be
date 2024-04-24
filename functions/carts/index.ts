import { z } from "zod";
import { HttpMethodEnum } from "@entities/http-request/http-request-entity";

interface Env {
  INVERN_DB: D1Database;
}

const bodySchema = z.object({});
export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  if (request.method !== HttpMethodEnum.POST) {
    return Response.json({ error: "method not allowed" }, { status: 405 });
  }
  try {
    const body = bodySchema.parse(await request.json());
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
