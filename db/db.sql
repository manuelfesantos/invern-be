PRAGMA defer_foreign_keys = on;

DROP TABLE IF EXISTS users;

CREATE TABLE IF NOT EXISTS users (
	userId VARCHAR(36) PRIMARY KEY,
	email VARCHAR(50) NOT NULL UNIQUE,
    firstName VARCHAR(50) NOT NULL,
    lastName VARCHAR(50) NOT NULL,
	password VARCHAR(100) NOT NULL,
	cartId VARCHAR(36) NOT NULL UNIQUE
);

DROP INDEX IF EXISTS idx_users_id;
DROP INDEX IF EXISTS idx_users_email;

DROP TABLE IF EXISTS collections;

CREATE TABLE IF NOT EXISTS collections(
    collectionId VARCHAR(36) PRIMARY KEY,
    collectionName VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(250) NOT NULL
);

DROP INDEX IF EXISTS idx_collections_id;

DROP TABLE IF EXISTS products;

CREATE TABLE IF NOT EXISTS products(
    productId VARCHAR(36) PRIMARY KEY,
    productName VARCHAR(50) NOT NULL,
    description VARCHAR(250) NOT NULL,
    price INTEGER NOT NULL,
    stock INTEGER NOT NULL,
    collectionId VARCHAR(36) NOT NULL,
    FOREIGN KEY(collectionId) REFERENCES collections(collectionId) ON DELETE CASCADE
);

DROP INDEX IF EXISTS idx_products_id;

DROP TABLE IF EXISTS productsCarts;

CREATE TABLE IF NOT EXISTS productsCarts(
    productId VARCHAR(36) NOT NULL,
    cartId VARCHAR(36) NOT NULL,
    quantity INTEGER DEFAULT 1,
    FOREIGN KEY(productId) REFERENCES products(productId) ON DELETE CASCADE,
    FOREIGN KEY(cartId) REFERENCES users(cartId) ON DELETE CASCADE,
    PRIMARY KEY(productId, cartId)
);

CREATE INDEX IF NOT EXISTS idx_product_cart ON productsCarts(cartId);

DROP TABLE IF EXISTS images;

CREATE TABLE IF NOT EXISTS images(
    imageId VARCHAR(36) PRIMARY KEY,
    url VARCHAR(250),
    alt VARCHAR(250),
    productId VARCHAR(36),
    collectionId VARCHAR(36) UNIQUE,
    FOREIGN KEY(productId) REFERENCES products(productId) ON DELETE CASCADE,
    FOREIGN KEY(collectionId) REFERENCES collections(collectionId) ON DELETE CASCADE
);

DROP INDEX IF EXISTS idx_images_id;

DROP TABLE IF EXISTS payments;

CREATE TABLE IF NOT EXISTS payments(
    paymentId VARCHAR(36) PRIMARY KEY
);

DROP INDEX IF EXISTS idx_payments_id;

DROP TABLE IF EXISTS orders;

CREATE TABLE IF NOT EXISTS orders(
    orderId VARCHAR(36) PRIMARY KEY,
    userId VARCHAR(36),
    shippingAddress VARCHAR(250) NOT NULL,
    billingAddress VARCHAR(250) NOT NULL,
    country VARCHAR(2) NOT NULL,
    paymentId VARCHAR(36) NOT NULL,
    creationDate DATE NOT NULL,
    FOREIGN KEY(userId) REFERENCES users(userId),
    FOREIGN KEY(paymentId) REFERENCES payments(paymentId)
);

DROP INDEX IF EXISTS idx_orders_id;

DROP TABLE IF EXISTS productsOrders;

CREATE TABLE IF NOT EXISTS productsOrders(
    productId VARCHAR(36) NOT NULL,
    orderId VARCHAR(36) NOT NULL,
    quantity INTEGER NOT NULL,
    FOREIGN KEY(productId) REFERENCES products(productId) ON DELETE CASCADE,
    FOREIGN KEY(orderId) REFERENCES orders(orderId) ON DELETE CASCADE,
    PRIMARY KEY(productId, orderId)
);

PRAGMA defer_foreign_keys = off