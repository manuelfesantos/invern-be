import { PagesFunction, D1Database } from '@cloudflare/workers-types';

interface Env {
    INVERN_DB: D1Database;
}

export const onRequest: PagesFunction<Env> = async (context) => {
    if(context.request.method === 'POST') {
        const body = await context.request.json();
        console.log(body);
        return new Response(JSON.stringify(body));
    }
    const db = context.env.INVERN_DB;
    await db.prepare(`INSERT INTO users (id, full_name) VALUES ('123', 'John Doe')`).run();
    return new Response("Hello!");
}