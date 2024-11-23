-- Project comaint 
-- Database schema version 1
-- MySQL Database clear script

USE db_comaint

--------------------------------------------------------------------------------
--     Tables                                                                 --
--------------------------------------------------------------------------------

SET FOREIGN_KEY_CHECKS = 0;

--
-- Table companies
--
DROP TABLE IF EXISTS companies;
--
-- Table users
--
DROP TABLE IF EXISTS users;
--
-- Table tokens
--
DROP TABLE IF EXISTS tokens;
--
-- Table units
--
DROP TABLE IF EXISTS units;


SET FOREIGN_KEY_CHECKS = 1;

--- end of sql script
