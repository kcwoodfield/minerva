-- Minerva Database Initialization Script
-- This script runs when the PostgreSQL container starts for the first time

-- Create extensions if they don't exist
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Set timezone
SET timezone = 'UTC';

-- Create additional databases if needed
-- CREATE DATABASE minerva_test;
-- CREATE DATABASE minerva_staging;

-- Grant privileges (these will be handled by Django migrations)
-- GRANT ALL PRIVILEGES ON DATABASE minerva TO minerva_user;
-- GRANT ALL PRIVILEGES ON DATABASE minerva_test TO minerva_user;
-- GRANT ALL PRIVILEGES ON DATABASE minerva_staging TO minerva_user;
