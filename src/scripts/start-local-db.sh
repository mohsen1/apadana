#!/bin/bash

if ! brew services list | grep -q "postgresql"; then
  echo "[start-local-db.sh] Starting local db..."
  brew services start postgresql
  echo "[start-local-db.sh] Waiting for PostgreSQL to start..."
  sleep 5 # Add a 5-second delay
  if brew services list | grep -q "postgresql.*started"; then
    echo "[start-local-db.sh] Local db started successfully"
  else
    echo "[start-local-db.sh] Failed to start PostgreSQL. Please check brew services"
    exit 1
  fi
else
  echo "[start-local-db.sh] PostgreSQL service is already running"
fi

# if local db is not configured, configure it
if ! psql -lqt | cut -d \| -f 1 | grep -qw "apadana"; then
  echo "[start-local-db.sh] Creating apadana db..."
  createdb apadana
  echo "[start-local-db.sh] apadana db created"
fi

# create the admin user, database and shadow database
psql -d apadana -c "DO \$\$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'admin') THEN
        CREATE USER admin WITH PASSWORD 'admin';
    END IF;
END
\$\$;" >/dev/null 2>&1

psql -d apadana -c "DO \$\$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'admin' AND rolcreatedb = true) THEN
        ALTER USER admin WITH CREATEDB;
    END IF;
END
\$\$;" >/dev/null 2>&1

psql -d apadana -c "SELECT 'CREATE DATABASE apadana_shadow'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'apadana_shadow')" >/dev/null 2>&1

# function to update .env.local with new env var or replace existing one
update_env_var() {
  local var_name=$1
  local var_value=$2
  # remove the line if it exists
  sed -i '' "/^$var_name=.*/d" .env.local
  # add the new line
  echo "$var_name=$var_value" >>.env.local
}

# Update .env.local with local db credentials
update_env_var "POSTGRES_HOST" "localhost"
update_env_var "POSTGRES_DATABASE" "apadana"
update_env_var "POSTGRES_URL" "postgresql://admin:admin@localhost:5432/apadana?schema=public"
update_env_var "POSTGRES_URL_NON_POOLING" "postgresql://admin:admin@localhost:5432/apadana?schema=public"
update_env_var "POSTGRES_URL_NO_SSL" "postgresql://admin:admin@localhost:5432/apadana?schema=public"
update_env_var "POSTGRES_USER" "admin"
update_env_var "POSTGRES_PASSWORD" "admin"
update_env_var "POSTGRES_PRISMA_URL" "not-needed"
