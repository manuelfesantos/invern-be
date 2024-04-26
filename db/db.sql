DROP TABLE IF EXISTS users;

CREATE TABLE IF NOT EXISTS users (
	id VARCHAR(100) PRIMARY KEY,
	email VARCHAR(50),
    firstName VARCHAR(50),
    lastName VARCHAR(50),
	password VARCHAR(100),
	cartId VARCHAR(100)
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);