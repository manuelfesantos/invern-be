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
  lastModifiedAt: int("lastModifiedAt").notNull(),
  isLoggedIn: int("isLoggedIn", {
    mode: "boolean",
  }).notNull(),
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
    .unique()
    .references(() => cartsTable.id, {
      onDelete: "set null",
    }),
  address: text("address"),
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
  weight: int("weight").notNull(),
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
  paymentId: text("paymentId").references(() => paymentsTable.id, {
    onDelete: "cascade",
  }),
  shippingTransactionId: text("shippingTransactionId")
    .references(() => shippingTransactionsTable.id, {
      onDelete: "cascade",
    })
    .notNull(),
  address: text("address").notNull(),
  country: text("country").notNull(),
  personalDetails: text("personalDetails").notNull(),
  shippingMethod: text("shippingMethod").notNull(),
  products: text("products").notNull(),
});

export const currenciesTable = sqliteTable("currencies", {
  code: text("currencyId").primaryKey(),
  name: text("name").notNull(),
  symbol: text("symbol").notNull(),
  rateToEuro: real("rateToEuro").notNull(),
  stripeName: text("stripeName").notNull(),
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
  code: text("code").notNull().primaryKey(),
  locale: text("locale").notNull(),
  currencyCode: text("currencyCode")
    .notNull()
    .references(() => currenciesTable.code, {
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
  expiresAt: text("expiresAt").notNull(),
  userId: text("userId").references(() => usersTable.id, {
    onDelete: "cascade",
  }),
  cartId: text("cartId").references(() => cartsTable.id, {
    onDelete: "cascade",
  }),
  shippingMethod: text("shippingMethod").notNull(),
  personalDetails: text("personalDetails").notNull(),
  country: text("country").notNull(),
  address: text("address").notNull(),
  orderId: text("orderId").notNull(),
});

export const shippingMethodsTable = sqliteTable("shippingMethods", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
});

export const shippingRatesTable = sqliteTable("shippingRates", {
  id: text("id").primaryKey(),
  priceInCents: int("priceInCents").notNull(),
  minWeight: int("minWeight").notNull(),
  maxWeight: int("maxWeight").notNull(),
  // Delivery time in business days
  deliveryTime: int("deliveryTime").notNull(),
  shippingMethodId: text("shippingMethodId")
    .references(() => shippingMethodsTable.id, {
      onDelete: "cascade",
    })
    .notNull(),
});

export const shippingRatesToCountriesTable = sqliteTable(
  "shippingRatesToCountries",
  {
    shippingRateId: text("shippingRateId")
      .notNull()
      .references(() => shippingRatesTable.id, {
        onDelete: "cascade",
      }),
    countryCode: text("countryCode")
      .notNull()
      .references(() => countriesTable.code, {
        onDelete: "cascade",
      }),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.shippingRateId, t.countryCode] }),
  }),
);

export const shippingTransactionsTable = sqliteTable("shippingTransactions", {
  id: text("id").primaryKey(),
  status: text("status", {
    enum: ["processing", "shipped", "delivered", "canceled"],
  }).notNull(),
  createdAt: text("createdAt").notNull(),
  updatedAt: text("updatedAt").notNull(),
  trackingUrl: text("trackingUrl"),
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

export const ordersRelations = relations(ordersTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [ordersTable.userId],
    references: [usersTable.id],
  }),
  payment: one(paymentsTable, {
    fields: [ordersTable.paymentId],
    references: [paymentsTable.id],
  }),
  shippingTransaction: one(shippingTransactionsTable, {
    fields: [ordersTable.shippingTransactionId],
    references: [shippingTransactionsTable.id],
  }),
}));

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
    currency: one(currenciesTable, {
      fields: [countriesTable.currencyCode],
      references: [currenciesTable.code],
    }),
    taxes: many(taxesTable),
    ratesToCountries: many(shippingRatesToCountriesTable),
  }),
);

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

export const shippingMethodsRelations = relations(
  shippingMethodsTable,
  ({ many }) => ({
    rates: many(shippingRatesTable),
  }),
);

export const shippingRatesRelations = relations(
  shippingRatesTable,
  ({ one, many }) => ({
    shippingMethod: one(shippingMethodsTable, {
      fields: [shippingRatesTable.shippingMethodId],
      references: [shippingMethodsTable.id],
    }),
    ratesToCountries: many(shippingRatesToCountriesTable),
  }),
);

export const shippingRatesToCountriesRelations = relations(
  shippingRatesToCountriesTable,
  ({ one }) => ({
    shippingRate: one(shippingRatesTable, {
      fields: [shippingRatesToCountriesTable.shippingRateId],
      references: [shippingRatesTable.id],
    }),
    country: one(countriesTable, {
      fields: [shippingRatesToCountriesTable.countryCode],
      references: [countriesTable.code],
    }),
  }),
);
