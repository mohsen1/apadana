#!/bin/bash

# This is essentially a postinstall
pnpm prisma:generate

# Exit on error
set -e

# Build for production. This script assumes all of the environment variables are set.
export AWS_DEPLOYMENT_STACK_ENV=$VERCEL_ENV

echo "Deploying AWS resources for '$AWS_DEPLOYMENT_STACK_ENV' environment in $AWS_REGION region"

# Start timing AWS deployment
start_time=$(date +%s)

# Show what will be deployed and capture the output
echo "Checking infrastructure changes..."
diff_output=$(pnpm cdk:diff --all --no-change-set)

# Check deployment time
end_time=$(date +%s)
elapsed=$((end_time - start_time))
if [ $elapsed -ge 2400 ]; then
  echo "Warning: AWS deployment took more than 40 minutes. This is likely because a lot of resources are being deployed."
  echo "Vercel build times are capped at 45 minutes. For faster iterations, consider running locally with:"
  echo "AWS_DEPLOYMENT_STACK_ENV=$AWS_DEPLOYMENT_STACK_ENV pnpm cdk:deploy --all --concurrency 10"
  exit 124
fi

# Install Vercel CLI
echo "Installing Vercel CLI..."
npm install --global --silent vercel@latest

# Get AWS environment variables and set them in Vercel
echo "Setting AWS environment variables in Vercel..."
pnpm -- aws:env >.env.production 2>&1 || exit 1

cat /tmp/deployment-values.env | while IFS='=' read -r key value; do
  # Write the environment variable to a temporary file.
  # This is done because of how Vercel CLI handles environment variables.
  filename="/tmp/__TEMP_ENV_VAR__$key.env"
  echo "$value" >$filename
  cat $filename | vercel env add "$key" "$VERCEL_ENV" --force --token "$VERCEL_TOKEN"
  rm -f $filename
  # Export the environment variable to the current shell session for the build script to use.
  export $key=$value

  # Wait for resources to be ready
  echo "Waiting for AWS resources to be ready..."
  pnpm cdk:wait
done

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
