#! /bin/bash

# check if this is a preview deployment
if [ "$VERCEL_ENV" == "preview" ]; then
  echo "Creating preview database for PR #$VERCEL_GIT_PULL_REQUEST_ID"
  ./src/scripts/manage-db.js create "preview_db_$VERCEL_GIT_PULL_REQUEST_ID"
  echo "Using preview database: $DATABASE_URL"
  export DATABASE_URL

  # Migrate the database
  pnpm run migrate:prod
  pnpm run build
else
  echo "Skipping preview database creation... VERCEL_ENV: $VERCEL_ENV"
  pnpm run build
fi
