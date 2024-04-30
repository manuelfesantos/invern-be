PRAGMA defer_foreign_keys = on;

DROP TABLE IF EXISTS productsCarts;

CREATE TABLE IF NOT EXISTS productsCarts(
    productCartId VARCHAR(100) PRIMARY KEY,
    productId VARCHAR(100),
    cartId VARCHAR(100),
    FOREIGN KEY(productId) REFERENCES products(productId) ON DELETE CASCADE,
    FOREIGN KEY(cartId) REFERENCES carts(cartId) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_products_carts_id ON productsCarts(productCartId);

PRAGMA defer_foreign_keys = off;