PRAGMA defer_foreign_keys = on;

DROP TABLE IF EXISTS carts;

CREATE TABLE IF NOT EXISTS carts (
    cartId VARCHAR(100) PRIMARY KEY
);

CREATE INDEX IF NOT EXISTS idx_carts_id ON carts(cartId);

PRAGMA defer_foreign_keys = off;
