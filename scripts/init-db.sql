-- Project comaint 
-- Database schema version 1
-- MySQL Database initialization script

-- CREATE SCHEMA db_comaint;
USE db_comaint
-- CREATE USER 'comaint'@'localhost' IDENTIFIED BY '<PASSWORD>';
-- GRANT ALL PRIVILEGES ON db_comaint.* TO 'comaint'@'localhost';


--------------------------------------------------------------------------------
--     Tables                                                                 --
--------------------------------------------------------------------------------


--
-- Table companies
--
CREATE TABLE companies(
	id INTEGER NOT NULL auto_increment,
	id_manager INTEGER,
	name VARCHAR(128) NOT NULL,
	PRIMARY KEY (id)
);


CREATE UNIQUE INDEX idx_name ON companies(
	name
	);

--
-- Table users
--
CREATE TABLE users(
	id INTEGER NOT NULL auto_increment,
	id_company INTEGER,
	email VARCHAR(96) NOT NULL,
	password VARCHAR(70) NOT NULL,
	firstname VARCHAR(30) NOT NULL,
	lastname VARCHAR(30) NOT NULL,
	account_locked BOOLEAN NOT NULL DEFAULT false,
	validation_code INTEGER DEFAULT '0',
	active BOOLEAN NOT NULL DEFAULT true,
	last_use DATETIME,
	administrator BOOLEAN NOT NULL DEFAULT false,
	stock_role TINYINT DEFAULT '0',
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


--------------------------------------------------------------------------------
--     Foreign keys                                                           --
--------------------------------------------------------------------------------


ALTER TABLE companies ADD CONSTRAINT fk_companies_manager
	FOREIGN KEY (id_manager)
	REFERENCES users(id)
	ON DELETE CASCADE;
ALTER TABLE users ADD CONSTRAINT fk_users_company
	FOREIGN KEY (id_company)
	REFERENCES companies(id)
	ON DELETE CASCADE;
ALTER TABLE tokens ADD CONSTRAINT fk_tokens_user
	FOREIGN KEY (id_user)
	REFERENCES users(id)
	ON DELETE CASCADE;

--- end of sql script
