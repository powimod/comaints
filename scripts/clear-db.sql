-- Project comaint 
-- Database schema version 1
-- MySQL Database initialization script

-- CREATE SCHEMA db_comaint;
USE db_comaint
-- CREATE USER 'comaint'@'localhost' IDENTIFIED BY 'g4m0-KauM1nt';
-- GRANT ALL PRIVILEGES ON db_comaint.* TO 'comaint'@'localhost';



SET @index_exists = (
  SELECT COUNT(*)
  FROM information_schema.statistics
  WHERE table_schema = 'nom_de_la_base'
  AND table_name = 'nom_de_la_table'
  AND index_name = 'idx_name'
);


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


SET FOREIGN_KEY_CHECKS = 1;

--- end of sql script
