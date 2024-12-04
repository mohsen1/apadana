#! /bin/bash

# Make sure source has the generated prisma client
PRISMA_OUTPUT_DIR=../src/__generated__/prisma pnpm run prisma:generate
pnpm run migrate:prod
pnpm run build
