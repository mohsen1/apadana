#!/usr/bin/env bash
set -euo pipefail

: "${DB_URL:?DB_URL environment variable not set}"

# Install dependencies
pnpm install

# Run Prisma migrations
pnpm prisma migrate deploy
