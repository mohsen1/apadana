#!/bin/bash

# Exit on error
set -e

# Build for production. This script assumes all of the environment variables are set.
export AWS_DEPLOYMENT_STACK_ENV=$VERCEL_ENV

echo "Deploying AWS resources for '$AWS_DEPLOYMENT_STACK_ENV' environment in $AWS_REGION region"

# Bootstrap CDK with cleanup
echo "Bootstrapping CDK..."
pnpm cdk:bootstrap
echo "Waiting for bootstrap to complete..."
sleep 30 # Give time for resources to be fully available

# Deploy AWS resources
echo "Deploying AWS infrastructure..."
pnpm cdk:deploy --all --require-approval never --concurrency 10

# Install Vercel CLI
echo "Installing Vercel CLI..."
npm install --global --silent vercel@latest

# Get AWS environment variables and set them in Vercel
echo "Setting AWS environment variables in Vercel..."
pnpm run --silent cdk:env | while IFS='=' read -r key value; do
  echo "$value" >/tmp/$key.aws.env
  cat /tmp/$key.aws.env | vercel env add "$key" "$VERCEL_ENV" --force --token "$VERCEL_TOKEN"
  export $key=$value
  rm -f /tmp/$key.aws.env
done

# Wait for resources to be ready
echo "Waiting for AWS resources to be ready..."
pnpm cdk:wait

# Deploy Prisma migrations
echo "Deploying database migrations..."
pnpm prisma:migrate

# In preview run seed
if [ "$VERCEL_ENV" == "preview" ]; then
  pnpm dev:prisma:seed
fi

# Build Next.js app
echo "Building Next.js application..."
pnpm build
