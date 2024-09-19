#!/bin/bash

# manage-db.sh
# Script to create or delete a PostgreSQL database for preview deployments.

# Usage:
#   ./src/scripts/manage-db.sh create <database_name>
#   ./src/scripts/manage-db.sh delete <database_name>

# Environment Variables:
#   POSTGRES_HOST         - PostgreSQL server host
#   POSTGRES_USER         - PostgreSQL username
#   POSTGRES_PASSWORD     - PostgreSQL password
#   POSTGRES_PORT         - (Optional) PostgreSQL server port (default: 5432)

set -e

# Check if the correct number of arguments are provided
if [ "$#" -ne 2 ]; then
  echo "Usage: $0 <create|delete> <database_name>"
  exit 1
fi

ACTION=$1
DB_NAME=$2

# Load environment variables
POSTGRES_HOST="${POSTGRES_HOST}"
POSTGRES_USER="${POSTGRES_USER}"
POSTGRES_PASSWORD="${POSTGRES_PASSWORD}"
POSTGRES_PORT="${POSTGRES_PORT:-5432}"

# Validate environment variables
if [ -z "$POSTGRES_HOST" ] || [ -z "$POSTGRES_USER" ] || [ -z "$POSTGRES_PASSWORD" ]; then
  echo "Error: POSTGRES_HOST, POSTGRES_USER, and POSTGRES_PASSWORD must be set as environment variables."
  exit 1
fi

# Function to create a database
create_database() {
  echo "Creating database '${DB_NAME}'..."

  PGPASSWORD="$POSTGRES_PASSWORD" psql -h "$POSTGRES_HOST" -U "$POSTGRES_USER" -p "$POSTGRES_PORT" -c "CREATE DATABASE \"$DB_NAME\";"
  echo "Database '${DB_NAME}' created successfully."

  # URL-encode the password
  ENCODED_PASSWORD=$(python3 -c "import urllib.parse; print(urllib.parse.quote('''$POSTGRES_PASSWORD'''))")

  # Construct DATABASE_URL
  DATABASE_URL="postgres://${POSTGRES_USER}:${ENCODED_PASSWORD}@${POSTGRES_HOST}:${POSTGRES_PORT}/${DB_NAME}"
  echo "DATABASE_URL=${DATABASE_URL}"
}

# Function to delete a database
delete_database() {
  echo "Deleting database '${DB_NAME}'..."

  PGPASSWORD="$POSTGRES_PASSWORD" psql -h "$POSTGRES_HOST" -U "$POSTGRES_USER" -p "$POSTGRES_PORT" -c "DROP DATABASE IF EXISTS \"$DB_NAME\";"
  echo "Database '${DB_NAME}' deleted successfully."
}

# Execute the appropriate action
case "$ACTION" in
create)
  create_database
  ;;
delete)
  delete_database
  ;;
*)
  echo "Error: Unknown action '$ACTION'. Use 'create' or 'delete'."
  exit 1
  ;;
esac
