#!/bin/bash

# Exit on error
set -e

# Build for production. This script assumes all of the environment variables are set.
export AWS_DEPLOYMENT_STACK_ENV=$VERCEL_ENV
export CDK_DEFAULT_ACCOUNT=$(echo $AWS_ACCESS_KEY_ID | cut -d '_' -f1)

echo "Deploying AWS resources for '$AWS_DEPLOYMENT_STACK_ENV' environment with account '$CDK_DEFAULT_ACCOUNT' in $AWS_REGION region"

# Deploy AWS resources
echo "Deploying AWS infrastructure..."
pnpm cdk:deploy --all --require-approval never --concurrency 10

# Wait for resources to be ready
echo "Waiting for AWS resources to be ready..."
pnpm cdk:wait

# Install Vercel CLI
echo "Installing Vercel CLI..."
npm install -g vercel@latest

# Get AWS environment variables and set them in Vercel
echo "Setting AWS environment variables in Vercel..."
pnpm run --silent cdk:print-values | while IFS='=' read -r key value; do
  echo "$value" >/tmp/$key.aws.env
  cat /tmp/$key.aws.env | vercel env add "$key" "$VERCEL_ENV" --force --token "$VERCEL_TOKEN"
  export $key=$value
  rm -f /tmp/$key.aws.env
done

# Deploy Prisma migrations
echo "Deploying database migrations..."
pnpm prisma:migrate

# Build Next.js app
echo "Building Next.js application..."
pnpm build
