DROP TABLE IF EXISTS users;

CREATE TABLE IF NOT EXISTS users (
	id VARCHAR(50),
	username VARCHAR(50),
	password VARCHAR(50),
	created_on DATE
);
