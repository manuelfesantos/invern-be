import {PagesFunction} from "@cloudflare/workers-types";
import {messages} from "@utils/constants";

export const onRequest: PagesFunction = async (context) => {

    return new Response(messages.hello);
}