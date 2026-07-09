import { Hono } from "hono";
import type { HonoEnv } from "../../types/hono";
import { requireAdmin } from "../../middleware/require-admin";
import currencies from "./currencies";
import countries from "./countries";
import products from "./products";
import collections from "./collections";
import carts from "./carts";
import users from "./users";
import orders from "./orders";
import images from "./images";
import shipping from "./shipping";
import stock from "./stock";
import taxes from "./taxes";
import dashboard from "./dashboard";
import maintenance from "./maintenance";

const privateRoutes = new Hono<HonoEnv>();

// Admin RBAC gates the whole subtree; the middleware self-bypasses the
// self-gated prefixes (stock/setup, expired/*) internally.
privateRoutes.use("*", requireAdmin);

privateRoutes.route("/currencies", currencies);
privateRoutes.route("/countries", countries);
privateRoutes.route("/products", products);
privateRoutes.route("/collections", collections);
privateRoutes.route("/carts", carts);
privateRoutes.route("/users", users);
privateRoutes.route("/orders", orders);
privateRoutes.route("/images", images);
privateRoutes.route("/shipping", shipping);
privateRoutes.route("/stock", stock);
privateRoutes.route("/taxes", taxes);
privateRoutes.route("/dashboard", dashboard);
privateRoutes.route("/expired", maintenance);

export default privateRoutes;
