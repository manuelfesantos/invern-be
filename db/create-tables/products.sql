PRAGMA defer_foreign_keys = on;

DROP TABLE IF EXISTS products;

CREATE TABLE IF NOT EXISTS products(
    productId VARCHAR(100) PRIMARY KEY,
    name VARCHAR(50),
    description VARCHAR(250),
    price INTEGER
);

CREATE INDEX IF NOT EXISTS idx_products_id ON products(productId);

PRAGMA defer_foreign_keys = off;