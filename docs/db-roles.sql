-- Recommended PostgreSQL roles (NOT applied automatically).
-- Run manually against your cluster after creating databases.

-- Application runtime role (least privilege)
-- CREATE ROLE autoyard_app LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE PASSWORD 'change-me';
-- GRANT CONNECT ON DATABASE dealership TO autoyard_app;
-- \c dealership
-- GRANT USAGE ON SCHEMA public TO autoyard_app;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO autoyard_app;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO autoyard_app;
-- ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO autoyard_app;
-- ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO autoyard_app;

-- Migrator role (deploy only; not for the API process)
-- CREATE ROLE autoyard_migrator LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE PASSWORD 'change-me';
-- GRANT CONNECT, CREATE ON DATABASE dealership TO autoyard_migrator;
-- \c dealership
-- GRANT ALL ON SCHEMA public TO autoyard_migrator;

-- Session safeguards (adjust units for your SLA)
-- ALTER ROLE autoyard_app SET statement_timeout = '30s';
-- ALTER ROLE autoyard_app SET idle_in_transaction_session_timeout = '60s';

-- Backup (dev/prod) — requires pg_dump/pg_restore on PATH
-- pg_dump --format=custom --file=backups/dealership-$(date +%Y%m%d%H%M).dump "$DATABASE_URL"
-- pg_restore --clean --if-exists --dbname="$DATABASE_URL" backups/dealership-YYYYMMDDHHMM.dump
