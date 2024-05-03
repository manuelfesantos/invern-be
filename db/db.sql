PRAGMA defer_foreign_keys = on;

DROP TABLE IF EXISTS users;

CREATE TABLE IF NOT EXISTS users (
	userId VARCHAR(36) PRIMARY KEY,
	email VARCHAR(50) NOT NULL,
    firstName VARCHAR(50) NOT NULL,
    lastName VARCHAR(50) NOT NULL,
	password VARCHAR(100) NOT NULL,
	cartId VARCHAR(36) NOT NULL UNIQUE
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_id ON users(userId);

DROP TABLE IF EXISTS collections;

CREATE TABLE IF NOT EXISTS collections(
    collectionId VARCHAR(36) PRIMARY KEY,
    collectionName VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(250) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_collections_id ON collections(collectionId);

DROP TABLE IF EXISTS products;

CREATE TABLE IF NOT EXISTS products(
    productId VARCHAR(36) PRIMARY KEY,
    productName VARCHAR(50) NOT NULL,
    description VARCHAR(250) NOT NULL,
    price INTEGER NOT NULL,
    collectionId VARCHAR(36) NOT NULL,
    FOREIGN KEY(collectionId) REFERENCES collections(collectionId) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_products_id ON products(productId);

DROP TABLE IF EXISTS productsCarts;

CREATE TABLE IF NOT EXISTS productsCarts(
    productId VARCHAR(36) NOT NULL,
    cartId VARCHAR(36) NOT NULL,
    quantity INTEGER DEFAULT 1,
    FOREIGN KEY(productId) REFERENCES products(productId) ON DELETE CASCADE,
    FOREIGN KEY(cartId) REFERENCES users(cartId) ON DELETE CASCADE,
    PRIMARY KEY(productId, cartId)
);

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

CREATE INDEX IF NOT EXISTS idx_images_id ON images(imageId);

DROP TABLE IF EXISTS orders;

CREATE TABLE IF NOT EXISTS orders(
    orderId VARCHAR(36) PRIMARY KEY,
    userId VARCHAR(36),
    FOREIGN KEY(userId) REFERENCES users(userId)
);

CREATE INDEX IF NOT EXISTS idx_orders_id ON orders(orderId);

DROP TABLE IF EXISTS productsOrders;

CREATE TABLE IF NOT EXISTS productsOrders(
    productId VARCHAR(36) NOT NULL,
    orderId VARCHAR(36) NOT NULL,
    FOREIGN KEY(productId) REFERENCES products(productId) ON DELETE CASCADE,
    FOREIGN KEY(orderId) REFERENCES orders(orderId) ON DELETE CASCADE,
    PRIMARY KEY(productId, orderId)
);

PRAGMA defer_foreign_keys = off