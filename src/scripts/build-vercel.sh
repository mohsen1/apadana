#! /bin/bash

# check if this is a preview deployment
if [ "$VERCEL_ENV" == "preview" ]; then
  # print all environment variables
  pnpm dlx dotenv -e .env -- echo "Environment variables: $VERCEL_ENV"
  pnpm dlx dotenv -e .env -- echo "Production database name: $POSTGRES_DATABASE"
  echo "Creating preview database for PR #$VERCEL_GIT_PULL_REQUEST_ID"
  pnpm run manage-db create "preview_db_$VERCEL_GIT_PULL_REQUEST_ID"
  # in case db already exists, purge it
  pnpm run manage-db purge "preview_db_$VERCEL_GIT_PULL_REQUEST_ID"
  pnpm run manage-db clone "$POSTGRES_DATABASE" "preview_db_$VERCEL_GIT_PULL_REQUEST_ID"

  # Migrate the database
  pnpm run migrate:prod
  pnpm run build
else
  echo "Skipping preview database creation... VERCEL_ENV: $VERCEL_ENV"
  pnpm run build
fi
