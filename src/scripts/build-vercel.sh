#! /bin/bash

# Build for production. This script assumes all of the environment variables are set.
# for build process to work, the following commands must be run

# id DATABASE_URL is not set exit
if [ -z "$DATABASE_URL" ]; then
  echo "DATABASE_URL is not set"
  exit 1
fi

pnpm prisma generate --no-hints
pnpm prisma migrate deploy
pnpm next build
