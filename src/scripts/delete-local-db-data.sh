#!/bin/bash

echo "[delete-local-db-data.sh] Deleting local database data..."

# Check if PostgreSQL service is running
if ! brew services list | grep -q "postgresql.*started"; then
  echo "[delete-local-db-data.sh] PostgreSQL is not running. Starting the service..."
  brew services start postgresql
  sleep 5 # Wait for PostgreSQL to start
fi

# Connect to the database and drop all tables
psql -d apadana -c "
DO \$\$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
        EXECUTE 'DROP TABLE IF EXISTS ' || quote_ident(r.tablename) || ' CASCADE';
    END LOOP;
END
\$\$;
" >/dev/null 2>&1

if [ $? -eq 0 ]; then
  echo "[delete-local-db-data.sh] All tables have been dropped successfully."
else
  echo "[delete-local-db-data.sh] Error occurred while dropping tables."
  exit 1
fi

# Reset the database sequence
psql -d apadana -c "
DO \$\$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT sequencename FROM pg_sequences WHERE schemaname = 'public') LOOP
        EXECUTE 'ALTER SEQUENCE ' || quote_ident(r.sequencename) || ' RESTART WITH 1';
    END LOOP;
END
\$\$;
" >/dev/null 2>&1

if [ $? -eq 0 ]; then
  echo "[delete-local-db-data.sh] All sequences have been reset successfully."
else
  echo "[delete-local-db-data.sh] Error occurred while resetting sequences."
  exit 1
fi

echo "[delete-local-db-data.sh] Local database data has been deleted."
