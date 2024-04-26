import { onRequest as __users_login_index_ts_onRequest } from "/Users/ctw03258/personal_projects/INVERN/invern-be/functions/users/index/index.ts"
import { onRequest as __users_signup_index_ts_onRequest } from "/Users/ctw03258/personal_projects/INVERN/invern-be/functions/users/signup/index.ts"
import { onRequest as __carts_index_ts_onRequest } from "/Users/ctw03258/personal_projects/INVERN/invern-be/functions/carts/index.ts"
import { onRequest as __users_index_ts_onRequest } from "/Users/ctw03258/personal_projects/INVERN/invern-be/functions/users/index.ts"
import { onRequest as __index_ts_onRequest } from "/Users/ctw03258/personal_projects/INVERN/invern-be/functions/index.ts"

export const routes = [
    {
      routePath: "/users/index",
      mountPath: "/users/index",
      method: "",
      middlewares: [],
      modules: [__users_login_index_ts_onRequest],
    },
  {
      routePath: "/users/signup",
      mountPath: "/users/signup",
      method: "",
      middlewares: [],
      modules: [__users_signup_index_ts_onRequest],
    },
  {
      routePath: "/carts",
      mountPath: "/carts",
      method: "",
      middlewares: [],
      modules: [__carts_index_ts_onRequest],
    },
  {
      routePath: "/users",
      mountPath: "/users",
      method: "",
      middlewares: [],
      modules: [__users_index_ts_onRequest],
    },
  {
      routePath: "/",
      mountPath: "/",
      method: "",
      middlewares: [],
      modules: [__index_ts_onRequest],
    },
  ]