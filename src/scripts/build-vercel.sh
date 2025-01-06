#!/bin/bash

# Build for production. This script assumes all of the environment variables are set.
# for build process to work, the following commands must be run

export AWS_DEPLOYMENT_STACK_ENV=$VERCEL_ENV
export CDK_DEFAULT_ACCOUNT=$(echo $AWS_ACCESS_KEY_ID | cut -d '_' -f1)

echo "Deploying AWS resources for '$AWS_DEPLOYMENT_STACK_ENV' environment with account '$CDK_DEFAULT_ACCOUNT' in $AWS_REGION region"

# Deploy AWS resources
pnpm cdk:deploy --all --require-approval never --concurrency 5

# Install Vercel CLI
echo "Running 'pnpm add --global vercel@latest'..."
mkdir -p /tmp/.pnpm
pnpm add --global --global-dir /tmp/.pnpm vercel@latest

# Get AWS environment variables and set them in Vercel
echo "Setting AWS environment variables in Vercel..."
pnpm run --silent cdk:print-values | while IFS='=' read -r key value; do
  echo "$value" >/tmp/$key.aws.env
  cat /tmp/$key.aws.env | vercel env add "$key" "$VERCEL_ENV" --force --token "$VERCEL_TOKEN"
done

# Generate Prisma client
pnpm prisma generate --no-hints --schema=src/prisma/schema.prisma

# Deploy Prisma migrations
pnpm prisma migrate deploy --schema=src/prisma/schema.prisma

# Build Next.js app
pnpm next build
