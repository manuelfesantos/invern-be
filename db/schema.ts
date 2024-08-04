import {
  sqliteTable,
  text,
  int,
  primaryKey,
  real,
} from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";

const DEFAULT_VERSION = 1;

//-----------------------------------SCHEMA-----------------------------------//

export const cartsTable = sqliteTable("carts", {
  cartId: text("cartId").primaryKey(),
  version: int("version").notNull().default(DEFAULT_VERSION),
});

export const usersTable = sqliteTable("users", {
  userId: text("userId").primaryKey(),
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
    .references(() => cartsTable.cartId, {
      onDelete: "cascade",
    }),
});

export const collectionsTable = sqliteTable("collections", {
  collectionId: text("collectionId").primaryKey(),
  collectionName: text("collectionName").notNull(),
  description: text("description").notNull(),
});

export const productsTable = sqliteTable("products", {
  productId: text("productId").primaryKey(),
  productName: text("productName").notNull(),
  description: text("description").notNull(),
  stock: int("stock").notNull(),
  collectionId: text("collectionId")
    .notNull()
    .references(() => collectionsTable.collectionId, { onDelete: "cascade" }),
  priceInCents: int("priceInCents").notNull(),
});

export const imagesTable = sqliteTable("images", {
  url: text("url").notNull().primaryKey(),
  alt: text("alt").notNull(),
  productId: text("productId")
    .notNull()
    .references(() => productsTable.productId, { onDelete: "cascade" }),
  collectionId: text("collectionId")
    .unique()
    .references(() => collectionsTable.collectionId, { onDelete: "set null" }),
});

export const productsToCartsTable = sqliteTable(
  "productsOnCarts",
  {
    cartId: text("cartId")
      .notNull()
      .references(() => cartsTable.cartId, { onDelete: "cascade" }),
    productId: text("productId")
      .notNull()
      .references(() => productsTable.productId, { onDelete: "cascade" }),
    quantity: int("quantity").notNull(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.cartId, t.productId] }),
  }),
);

export const ordersTable = sqliteTable("orders", {
  orderId: text("orderId").primaryKey(),
  clientOrderId: text("clientOrderId").unique().notNull(),
  createdAt: text("createdAt").notNull(),
  userId: text("userId").references(() => usersTable.userId, {
    onDelete: "cascade",
  }),
  addressId: text("addressId").references(() => addressesTable.addressId, {
    onDelete: "cascade",
  }),
  paymentId: text("paymentId").references(() => paymentsTable.paymentId, {
    onDelete: "cascade",
  }),
  countryCode: text("countryId").references(() => countriesTable.code, {
    onDelete: "cascade",
  }),
});

export const productsToOrdersTable = sqliteTable(
  "productsToOrders",
  {
    orderId: text("orderId")
      .notNull()
      .references(() => ordersTable.orderId, { onDelete: "cascade" }),
    productId: text("productId")
      .notNull()
      .references(() => productsTable.productId, { onDelete: "cascade" }),
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
  taxId: text("taxId").primaryKey(),
  name: text("name").notNull(),
  rate: int("amount"),
  amount: int("amount"),
  countryCode: text("countryId")
    .notNull()
    .references(() => countriesTable.code, {
      onDelete: "cascade",
    }),
});

export const countriesTable = sqliteTable("countries", {
  name: text("name").notNull(),
  code: text("code").notNull().primaryKey(),
});

export const countriesToCurrenciesTable = sqliteTable(
  "countriesToCurrencies",
  {
    countryCode: text("countryId")
      .notNull()
      .references(() => countriesTable.code, {
        onDelete: "cascade",
      }),
    currencyCode: text("currencyId")
      .notNull()
      .references(() => currenciesTable.code, {
        onDelete: "cascade",
      }),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.countryCode, t.currencyCode] }),
  }),
);

export const addressesTable = sqliteTable("addresses", {
  addressId: text("addressId").primaryKey(),
  line1: text("line1").notNull(),
  line2: text("line2").notNull(),
  postalCode: text("postalCode").notNull(),
  city: text("city").notNull(),
  country: text("countryId")
    .notNull()
    .references(() => countriesTable.code, {
      onDelete: "cascade",
    }),
});

export const paymentsTable = sqliteTable("payments", {
  paymentId: text("paymentId").primaryKey(),
  createdAt: text("createdAt").notNull(),
  type: text("type", { enum: ["draft", "card", "paypal"] }).notNull(),
  state: text("state", {
    enum: ["draft", "succeeded", "canceled", "created", "processing", "failed"],
  }).notNull(),
  amount: int("amount").notNull(),
});

//---------------------------------RELATIONS---------------------------------//

export const usersRelations = relations(usersTable, ({ one, many }) => ({
  cart: one(cartsTable, {
    fields: [usersTable.cartId],
    references: [cartsTable.cartId],
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
    references: [collectionsTable.collectionId],
  }),
  productsToCarts: many(productsToCartsTable),
  productsToOrders: many(productsToOrdersTable),
}));

export const imagesRelations = relations(imagesTable, ({ one }) => ({
  product: one(productsTable, {
    fields: [imagesTable.productId],
    references: [productsTable.productId],
  }),
  collection: one(collectionsTable, {
    fields: [imagesTable.collectionId],
    references: [collectionsTable.collectionId],
  }),
}));

export const productsToCartsRelations = relations(
  productsToCartsTable,
  ({ one }) => ({
    product: one(productsTable, {
      fields: [productsToCartsTable.productId],
      references: [productsTable.productId],
    }),
    cart: one(cartsTable, {
      fields: [productsToCartsTable.cartId],
      references: [cartsTable.cartId],
    }),
  }),
);

export const ordersRelations = relations(ordersTable, ({ one, many }) => ({
  user: one(usersTable, {
    fields: [ordersTable.userId],
    references: [usersTable.userId],
  }),
  address: one(addressesTable, {
    fields: [ordersTable.addressId],
    references: [addressesTable.addressId],
  }),
  productsToOrders: many(productsToOrdersTable),
  payment: one(paymentsTable, {
    fields: [ordersTable.paymentId],
    references: [paymentsTable.paymentId],
  }),
}));

export const productsToOrdersRelations = relations(
  productsToOrdersTable,
  ({ one }) => ({
    order: one(ordersTable, {
      fields: [productsToOrdersTable.orderId],
      references: [ordersTable.orderId],
    }),
    product: one(productsTable, {
      fields: [productsToOrdersTable.productId],
      references: [productsTable.productId],
    }),
  }),
);

export const currenciesRelations = relations(currenciesTable, ({ many }) => ({
  countriesToCurrencies: many(countriesToCurrenciesTable),
}));

export const taxesRelations = relations(taxesTable, ({ one }) => ({
  country: one(countriesTable, {
    fields: [taxesTable.countryCode],
    references: [countriesTable.code],
  }),
}));

export const countriesRelations = relations(countriesTable, ({ many }) => ({
  addresses: many(addressesTable),
  countriesToCurrencies: many(countriesToCurrenciesTable),
  taxes: many(taxesTable),
}));

export const countriesToCurrenciesRelations = relations(
  countriesToCurrenciesTable,
  ({ one }) => ({
    country: one(countriesTable, {
      fields: [countriesToCurrenciesTable.countryCode],
      references: [countriesTable.code],
    }),
    currency: one(currenciesTable, {
      fields: [countriesToCurrenciesTable.currencyCode],
      references: [currenciesTable.code],
    }),
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
