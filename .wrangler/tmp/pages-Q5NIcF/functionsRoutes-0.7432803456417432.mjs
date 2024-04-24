import { onRequest as __hasher_ts_onRequest } from "/Users/ctw03258/personal_projects/INVERN/invern-be/functions/hasher.ts"
import { onRequest as __hi_ts_onRequest } from "/Users/ctw03258/personal_projects/INVERN/invern-be/functions/hi.ts"
import { onRequest as __signup_ts_onRequest } from "/Users/ctw03258/personal_projects/INVERN/invern-be/functions/signup/index.ts"
import { onRequest as __index_ts_onRequest } from "/Users/ctw03258/personal_projects/INVERN/invern-be/functions/index.ts"

export const routes = [
    {
      routePath: "/hasher",
      mountPath: "/",
      method: "",
      middlewares: [],
      modules: [__hasher_ts_onRequest],
    },
  {
      routePath: "/hi",
      mountPath: "/",
      method: "",
      middlewares: [],
      modules: [__hi_ts_onRequest],
    },
  {
      routePath: "/signup",
      mountPath: "/",
      method: "",
      middlewares: [],
      modules: [__signup_ts_onRequest],
    },
  {
      routePath: "/",
      mountPath: "/",
      method: "",
      middlewares: [],
      modules: [__index_ts_onRequest],
    },
  ]