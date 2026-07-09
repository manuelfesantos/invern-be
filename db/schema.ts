import {
  index,
  int,
  primaryKey,
  real,
  sqliteTable,
  text,
} from "drizzle-orm/sqlite-core";
import { relations, sql } from "drizzle-orm";

const DEFAULT_VERSION = 1;
const VALUE_ZERO = 0;

//-----------------------------------SCHEMA-----------------------------------//

const baseResource = {
  createdAt: text("created_at")
    .notNull()
    .default(sql`(strftime('%Y-%m-%dT%H:%M:%f', 'now'))`),
  lastModifiedAt: text("last_modified_at")
    .notNull()
    .default(sql`(strftime('%Y-%m-%dT%H:%M:%f', 'now'))`),
};

const baseResourceWithId = {
  ...baseResource,
  id: text("id").primaryKey(),
};

export const cartsTable = sqliteTable("carts", {
  ...baseResourceWithId,
  isLoggedIn: int("is_logged_in", {
    mode: "boolean",
  }).notNull(),
});

export const usersTable = sqliteTable("users", {
  ...baseResourceWithId,
  email: text("email").unique().notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name"),
  password: text("password"),
  version: int("version").notNull().default(DEFAULT_VERSION),
  role: text("role", { enum: ["ADMIN", "USER"] })
    .notNull()
    .default("USER"),
  cartId: text("cart_id")
    .unique()
    .references(() => cartsTable.id, {
      onDelete: "set null",
    }),
  address: text("address"),
  isOauth: int("is_oauth", {
    mode: "boolean",
  })
    .notNull()
    .default(false),
  googleUserId: text("google_user_id").unique(),
  isValidated: int("is_validated", {
    mode: "boolean",
  })
    .notNull()
    .default(false),
});

export const collectionsTable = sqliteTable("collections", {
  ...baseResourceWithId,
  name: text("name").notNull(),
  description: text("description").notNull(),
});

export const productsTable = sqliteTable("products", {
  ...baseResourceWithId,
  name: text("name").notNull(),
  description: text("description").notNull(),
  stock: int("stock").notNull(),
  collectionId: text("collection_id")
    .notNull()
    .references(() => collectionsTable.id, { onDelete: "cascade" }),
  priceInCents: int("price_in_cents").notNull(),
  weight: int("weight").notNull(),
});

export const imagesTable = sqliteTable(
  "images",
  {
    ...baseResource,
    url: text("url").notNull().primaryKey(),
    alt: text("alt").notNull(),
    productId: text("product_id")
      .notNull()
      .references(() => productsTable.id, { onDelete: "cascade" }),
    collectionId: text("collection_id")
      .unique()
      .references(() => collectionsTable.id, { onDelete: "set null" }),
    isThumbnail: int("is_thumbnail", {
      mode: "boolean",
    })
      .notNull()
      .default(false),
  },
  (t) => [index("product_id_index").on(t.productId)],
);

export const productsToCartsTable = sqliteTable(
  "products_on_carts",
  {
    cartId: text("cart_id")
      .notNull()
      .references(() => cartsTable.id, { onDelete: "cascade" }),
    productId: text("product_id")
      .notNull()
      .references(() => productsTable.id, { onDelete: "cascade" }),
    quantity: int("quantity").notNull(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.cartId, t.productId] }),
  }),
);

export const ordersTable = sqliteTable("orders", {
  ...baseResourceWithId,
  stripeId: text("stripe_id").notNull().unique(),
  userId: text("user_id").references(() => usersTable.id, {
    onDelete: "cascade",
  }),
  paymentId: text("payment_id").references(() => paymentsTable.id, {
    onDelete: "cascade",
  }),
  shippingTransactionId: text("shipping_transaction_id")
    .references(() => shippingTransactionsTable.id, {
      onDelete: "cascade",
    })
    .notNull(),
  address: text("address").notNull(),
  country: text("country").notNull(),
  personalDetails: text("personal_details").notNull(),
  shippingMethod: text("shipping_method").notNull(),
  products: text("products").notNull(),
  isCanceled: int("is_canceled", {
    mode: "boolean",
  }),
});

export const currenciesTable = sqliteTable("currencies", {
  ...baseResource,
  code: text("code").primaryKey(),
  name: text("name").notNull(),
  symbol: text("symbol").notNull(),
  rateToEuro: real("rate_to_euro").notNull(),
  stripeName: text("stripe_name").notNull(),
});

export const taxesTable = sqliteTable("taxes", {
  ...baseResourceWithId,
  name: text("name").notNull(),
  // Fraction (e.g. 0.23 = 23%); consumed by the extender as priceInCents * rate.
  // REAL affinity so the fraction is stored/typed honestly (was `int`, which
  // only survived via SQLite's lossless-int affinity — fragile).
  rate: real("rate"),
  countryCode: text("country_id")
    .notNull()
    .references(() => countriesTable.code, {
      onDelete: "cascade",
    }),
});

export const countriesTable = sqliteTable("countries", {
  ...baseResource,
  name: text("name").notNull(),
  code: text("code").notNull().primaryKey(),
  locale: text("locale").notNull(),
  currencyCode: text("currency_code")
    .notNull()
    .references(() => currenciesTable.code, {
      onDelete: "cascade",
    }),
});

export const paymentsTable = sqliteTable("payments", {
  ...baseResourceWithId,
  state: text("state", {
    enum: ["draft", "succeeded", "canceled", "created", "processing", "failed"],
  }).notNull(),
  netAmount: int("net_amount").notNull().default(VALUE_ZERO),
  grossAmount: int("gross_amount").notNull(),
  paymentMethodId: text("payment_method_id").references(
    () => paymentMethodsTable.id,
    {
      onDelete: "cascade",
    },
  ),
});

export const paymentMethodsTable = sqliteTable("payment_methods", {
  ...baseResourceWithId,
  type: text("type", { enum: ["card", "paypal"] }).notNull(),
  brand: text("issuer"),
  last4: text("last_4"),
});

export const checkoutSessionsTable = sqliteTable("checkout_sessions", {
  ...baseResourceWithId,
  products: text("products").notNull(),
  expiresAt: text("expires_at").notNull(),
  userId: text("user_id").references(() => usersTable.id, {
    onDelete: "cascade",
  }),
  cartId: text("cart_id").references(() => cartsTable.id, {
    onDelete: "cascade",
  }),
  shippingMethod: text("shipping_method").notNull(),
  personalDetails: text("personal_details").notNull(),
  country: text("country").notNull(),
  address: text("address").notNull(),
  orderId: text("order_id").notNull(),
});

export const shippingMethodsTable = sqliteTable("shipping_methods", {
  ...baseResourceWithId,
  name: text("name").notNull(),
});

export const shippingRatesTable = sqliteTable("shipping_rates", {
  ...baseResourceWithId,
  priceInCents: int("price_in_cents").notNull(),
  minWeight: int("min_weight").notNull(),
  maxWeight: int("max_weight").notNull(),
  // Delivery time in business days
  deliveryTime: int("delivery_time").notNull(),
  shippingMethodId: text("shipping_method_id")
    .references(() => shippingMethodsTable.id, {
      onDelete: "cascade",
    })
    .notNull(),
});

export const shippingRatesToCountriesTable = sqliteTable(
  "shipping_rates_to_countries",
  {
    shippingRateId: text("shipping_rate_id")
      .notNull()
      .references(() => shippingRatesTable.id, {
        onDelete: "cascade",
      }),
    countryCode: text("country_code")
      .notNull()
      .references(() => countriesTable.code, {
        onDelete: "cascade",
      }),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.shippingRateId, t.countryCode] }),
  }),
);

export const shippingTransactionsTable = sqliteTable("shipping_transactions", {
  ...baseResourceWithId,
  status: text("status", {
    enum: ["processing", "shipped", "delivered", "canceled"],
  }).notNull(),
  trackingUrl: text("tracking_url"),
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

export const paymentMethodsRelations = relations(
  paymentMethodsTable,
  ({ many }) => ({
    payments: many(paymentsTable),
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
  paymentMethod: one(paymentMethodsTable, {
    fields: [paymentsTable.paymentMethodId],
    references: [paymentMethodsTable.id],
  }),
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
