PRAGMA defer_foreign_keys = on;

DROP TABLE IF EXISTS users;

CREATE TABLE IF NOT EXISTS users (
	userId VARCHAR(100) PRIMARY KEY,
	email VARCHAR(50),
    firstName VARCHAR(50),
    lastName VARCHAR(50),
	password VARCHAR(100),
	cartId VARCHAR(100),
	FOREIGN KEY (cartId) REFERENCES carts(cartId)
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_id ON users(userId);

PRAGMA defer_foreign_keys = off;