PRAGMA defer_foreign_keys = on;

DROP TABLE IF EXISTS images;

CREATE TABLE IF NOT EXISTS images(
    url VARCHAR(250) PRIMARY KEY,
    alt VARCHAR(250),
    productId VARCHAR(100),
    FOREIGN KEY(productId) REFERENCES products(productId) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_images_id ON images(url);

PRAGMA defer_foreign_keys = off;