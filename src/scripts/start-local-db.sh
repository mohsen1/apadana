#!/bin/bash

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

