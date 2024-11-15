-- Project comaint 
-- Database schema version 1
-- MySQL Database initialization script

-- CREATE SCHEMA db_comaint;
USE db_comaint
-- CREATE USER 'comaint'@'localhost' IDENTIFIED BY 'g4m0-KauM1nt';
-- GRANT ALL PRIVILEGES ON db_comaint.* TO 'comaint'@'localhost';


--------------------------------------------------------------------------------
--     Tables                                                                 --
--------------------------------------------------------------------------------


--
-- Table companies
--
CREATE TABLE companies(
	id INTEGER NOT NULL auto_increment,
	name VARCHAR(128) NOT NULL,
	PRIMARY KEY (id)
);



--
-- Table users
--
CREATE TABLE users(
	id INTEGER NOT NULL auto_increment,
	id_company INTEGER,
	email VARCHAR(96) NOT NULL,
	password VARCHAR(70) NOT NULL,
	firstname VARCHAR(30),
	lastname VARCHAR(30),
	state INTEGER NOT NULL DEFAULT '0',
	last_use DATETIME,
	administrator BOOLEAN NOT NULL DEFAULT false,
	manager BOOLEAN NOT NULL DEFAULT false,
	auth_action VARCHAR(16),
	auth_data VARCHAR(255),
	auth_code INTEGER DEFAULT '0',
	auth_expiration DATETIME,
	auth_attempts INTEGER DEFAULT '0',
	PRIMARY KEY (id)
);


CREATE UNIQUE INDEX idx_email ON users(
	email
	);
CREATE UNIQUE INDEX idx_idx_company_lastname_firstname ON users(
	id_company,
	lastname,
	firstname
	);
CREATE INDEX idx_idx_company ON users(
	id_company
	);

--
-- Table tokens
--
CREATE TABLE tokens(
	id INTEGER NOT NULL auto_increment,
	id_user INTEGER NOT NULL,
	expires_at DATETIME NOT NULL,
	PRIMARY KEY (id)
);


CREATE INDEX idx_idx_user ON tokens(
	id_user
	);

--
-- Table units
--
CREATE TABLE units(
	id INTEGER NOT NULL auto_increment,
	id_company INTEGER NOT NULL,
	name VARCHAR(32) NOT NULL,
	description VARCHAR(255),
	address TEXT NOT NULL DEFAULT '',
	city TEXT NOT NULL DEFAULT '',
	zip_code TEXT NOT NULL DEFAULT '',
	country TEXT NOT NULL DEFAULT '',
	PRIMARY KEY (id)
);


CREATE UNIQUE INDEX idx_idx_company_name ON units(
	id_company,
	name
	);


--------------------------------------------------------------------------------
--     Foreign keys                                                           --
--------------------------------------------------------------------------------


ALTER TABLE users ADD CONSTRAINT fk_users_company
	FOREIGN KEY (id_company)
	REFERENCES companies(id)
	ON DELETE CASCADE;
ALTER TABLE tokens ADD CONSTRAINT fk_tokens_user
	FOREIGN KEY (id_user)
	REFERENCES users(id)
	ON DELETE CASCADE;
ALTER TABLE units ADD CONSTRAINT fk_units_company
	FOREIGN KEY (id_company)
	REFERENCES companies(id)
	ON DELETE CASCADE;

--- end of sql script
