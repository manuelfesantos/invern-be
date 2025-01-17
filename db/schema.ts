import {
  int,
  primaryKey,
  real,
  sqliteTable,
  text,
} from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";

const DEFAULT_VERSION = 1;
const VALUE_ZERO = 0;

//-----------------------------------SCHEMA-----------------------------------//

export const cartsTable = sqliteTable("carts", {
  id: text("id").primaryKey(),
});

export const usersTable = sqliteTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull(),
  firstName: text("firstName").notNull(),
  lastName: text("lastName").notNull(),
  password: text("password").notNull(),
  version: int("version").notNull().default(DEFAULT_VERSION),
  role: text("role", { enum: ["ADMIN", "USER"] })
    .notNull()
    .default("USER"),
  cartId: text("cartId")
    .notNull()
    .references(() => cartsTable.id, {
      onDelete: "cascade",
    }),
});

export const collectionsTable = sqliteTable("collections", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
});

export const productsTable = sqliteTable("products", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  stock: int("stock").notNull(),
  collectionId: text("collectionId")
    .notNull()
    .references(() => collectionsTable.id, { onDelete: "cascade" }),
  priceInCents: int("priceInCents").notNull(),
});

export const imagesTable = sqliteTable("images", {
  url: text("url").notNull().primaryKey(),
  alt: text("alt").notNull(),
  productId: text("productId")
    .notNull()
    .references(() => productsTable.id, { onDelete: "cascade" }),
  collectionId: text("collectionId")
    .unique()
    .references(() => collectionsTable.id, { onDelete: "set null" }),
});

export const productsToCartsTable = sqliteTable(
  "productsOnCarts",
  {
    cartId: text("cartId")
      .notNull()
      .references(() => cartsTable.id, { onDelete: "cascade" }),
    productId: text("productId")
      .notNull()
      .references(() => productsTable.id, { onDelete: "cascade" }),
    quantity: int("quantity").notNull(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.cartId, t.productId] }),
  }),
);

export const ordersTable = sqliteTable("orders", {
  id: text("id").primaryKey(),
  stripeId: text("stripeId").unique().notNull(),
  createdAt: text("createdAt").notNull(),
  userId: text("userId").references(() => usersTable.id, {
    onDelete: "cascade",
  }),
  addressId: text("addressId").references(() => addressesTable.id, {
    onDelete: "cascade",
  }),
  paymentId: text("paymentId").references(() => paymentsTable.id, {
    onDelete: "cascade",
  }),
  snapshot: text("snapshot"),
});

export const productsToOrdersTable = sqliteTable(
  "productsToOrders",
  {
    orderId: text("orderId")
      .notNull()
      .references(() => ordersTable.id, { onDelete: "cascade" }),
    productId: text("productId")
      .notNull()
      .references(() => productsTable.id, { onDelete: "cascade" }),
    quantity: int("quantity").notNull(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.orderId, t.productId] }),
  }),
);

export const currenciesTable = sqliteTable("currencies", {
  code: text("currencyId").primaryKey(),
  name: text("name").notNull(),
  symbol: text("symbol").notNull(),
  rateToEuro: real("rateToEuro").notNull(),
});

export const taxesTable = sqliteTable("taxes", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  rate: int("rate"),
  countryCode: text("countryId")
    .notNull()
    .references(() => countriesTable.code, {
      onDelete: "cascade",
    }),
});

export const countriesTable = sqliteTable("countries", {
  name: text("name").notNull(),
  code: text("code", { enum: ["PT", "ES"] })
    .notNull()
    .primaryKey(),
  currencyCode: text("currencyCode")
    .notNull()
    .references(() => currenciesTable.code, {
      onDelete: "cascade",
    }),
});

export const addressesTable = sqliteTable("addresses", {
  id: text("id").primaryKey(),
  line1: text("line1").notNull(),
  line2: text("line2"),
  postalCode: text("postalCode").notNull(),
  city: text("city").notNull(),
  country: text("countryId")
    .notNull()
    .references(() => countriesTable.code, {
      onDelete: "cascade",
    }),
});

export const paymentsTable = sqliteTable("payments", {
  id: text("id").primaryKey(),
  createdAt: text("createdAt").notNull(),
  type: text("type", { enum: ["draft", "card", "paypal"] }).notNull(),
  state: text("state", {
    enum: ["draft", "succeeded", "canceled", "created", "processing", "failed"],
  }).notNull(),
  netAmount: int("netAmount").notNull().default(VALUE_ZERO),
  grossAmount: int("grossAmount").notNull(),
});

export const checkoutSessionsTable = sqliteTable("checkoutSessions", {
  id: text("id").primaryKey(),
  products: text("products").notNull(),
  createdAt: text("createdAt").notNull(),
  expiresAt: int("expiresAt").notNull(),
  userId: text("userId").references(() => usersTable.id, {
    onDelete: "cascade",
  }),
  cartId: text("cartId").references(() => cartsTable.id, {
    onDelete: "cascade",
  }),
});

//---------------------------------RELATIONS---------------------------------//

export const usersRelations = relations(usersTable, ({ one, many }) => ({
  cart: one(cartsTable, {
    fields: [usersTable.cartId],
    references: [cartsTable.id],
  }),
  orders: many(ordersTable),
}));

export const cartsRelations = relations(cartsTable, ({ one, many }) => ({
  user: one(usersTable),
  productsToCarts: many(productsToCartsTable),
}));

export const collectionsRelations = relations(
  collectionsTable,
  ({ many, one }) => ({
    products: many(productsTable),
    images: one(imagesTable),
  }),
);

export const productsRelations = relations(productsTable, ({ many, one }) => ({
  images: many(imagesTable),
  collection: one(collectionsTable, {
    fields: [productsTable.collectionId],
    references: [collectionsTable.id],
  }),
  productsToCarts: many(productsToCartsTable),
  productsToOrders: many(productsToOrdersTable),
}));

export const imagesRelations = relations(imagesTable, ({ one }) => ({
  product: one(productsTable, {
    fields: [imagesTable.productId],
    references: [productsTable.id],
  }),
  collection: one(collectionsTable, {
    fields: [imagesTable.collectionId],
    references: [collectionsTable.id],
  }),
}));

export const productsToCartsRelations = relations(
  productsToCartsTable,
  ({ one }) => ({
    product: one(productsTable, {
      fields: [productsToCartsTable.productId],
      references: [productsTable.id],
    }),
    cart: one(cartsTable, {
      fields: [productsToCartsTable.cartId],
      references: [cartsTable.id],
    }),
  }),
);

export const ordersRelations = relations(ordersTable, ({ one, many }) => ({
  user: one(usersTable, {
    fields: [ordersTable.userId],
    references: [usersTable.id],
  }),
  address: one(addressesTable, {
    fields: [ordersTable.addressId],
    references: [addressesTable.id],
  }),
  productsToOrders: many(productsToOrdersTable),
  payment: one(paymentsTable, {
    fields: [ordersTable.paymentId],
    references: [paymentsTable.id],
  }),
}));

export const productsToOrdersRelations = relations(
  productsToOrdersTable,
  ({ one }) => ({
    order: one(ordersTable, {
      fields: [productsToOrdersTable.orderId],
      references: [ordersTable.id],
    }),
    product: one(productsTable, {
      fields: [productsToOrdersTable.productId],
      references: [productsTable.id],
    }),
  }),
);

export const currenciesRelations = relations(currenciesTable, ({ many }) => ({
  countries: many(countriesTable),
}));

export const taxesRelations = relations(taxesTable, ({ one }) => ({
  country: one(countriesTable, {
    fields: [taxesTable.countryCode],
    references: [countriesTable.code],
  }),
}));

export const countriesRelations = relations(
  countriesTable,
  ({ one, many }) => ({
    addresses: many(addressesTable),
    currency: one(currenciesTable, {
      fields: [countriesTable.currencyCode],
      references: [currenciesTable.code],
    }),
    taxes: many(taxesTable),
  }),
);

export const addressesRelations = relations(addressesTable, ({ one }) => ({
  country: one(countriesTable, {
    fields: [addressesTable.country],
    references: [countriesTable.code],
  }),
}));

export const paymentsRelations = relations(paymentsTable, ({ one }) => ({
  orders: one(ordersTable),
}));

export const checkoutSessionsRelations = relations(
  checkoutSessionsTable,
  ({ one }) => ({
    user: one(usersTable, {
      fields: [checkoutSessionsTable.userId],
      references: [usersTable.id],
    }),
    cart: one(cartsTable, {
      fields: [checkoutSessionsTable.cartId],
      references: [cartsTable.id],
    }),
  }),
);
