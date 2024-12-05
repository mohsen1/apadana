#! /bin/bash

# Build for production. This script assumes all of the environment variables are set.
# for build process to work, the following commands must be run

pnpm prisma generate --no-hints
pnpm prisma migrate deploy
pnpm next build
