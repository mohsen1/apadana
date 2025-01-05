#!/bin/bash
set -e

echo "Starting Vercel build process..."

# Check for required environment variables with detailed messages
if [ -z "$VERCEL_ENV" ]; then
  echo "Error: VERCEL_ENV is not set"
  echo "This script must be run in a Vercel environment"
  exit 1
fi

if [ -z "$AWS_ACCESS_KEY_ID" ]; then
  echo "Error: AWS_ACCESS_KEY_ID is not set"
  echo "Please add AWS_ACCESS_KEY_ID to your Vercel environment variables"
  exit 1
fi

if [ -z "$AWS_SECRET_ACCESS_KEY" ]; then
  echo "Error: AWS_SECRET_ACCESS_KEY is not set"
  echo "Please add AWS_SECRET_ACCESS_KEY to your Vercel environment variables"
  exit 1
fi

if [ -z "$AWS_REGION" ]; then
  echo "Warning: AWS_REGION is not set, defaulting to us-east-1"
  export AWS_REGION="us-east-1"
fi

# Set AWS_DEPLOYMENT_STACK_ENV based on VERCEL_ENV
if [ "$VERCEL_ENV" = "preview" ]; then
  export AWS_DEPLOYMENT_STACK_ENV="preview"
elif [ "$VERCEL_ENV" = "development" ]; then
  export AWS_DEPLOYMENT_STACK_ENV="development"
else
  export AWS_DEPLOYMENT_STACK_ENV="production"
fi

echo "Using AWS deployment stack environment: $AWS_DEPLOYMENT_STACK_ENV"
echo "AWS Region: $AWS_REGION"

# Function to wait for resources with timeout and verbose logging
wait_for_resources() {
  local max_attempts=30
  local attempt=1
  local wait_time=10

  echo "Starting resource validation with max $max_attempts attempts..."
  echo "Will wait $wait_time seconds between attempts"

  while [ $attempt -le $max_attempts ]; do
    echo "🔄 Attempt $attempt of $max_attempts"

    if pnpm run aws:preflight; then
      echo "✅ All resources are ready!"
      return 0
    fi

    echo "⏳ Resources not ready yet. Waiting $wait_time seconds before next attempt..."
    sleep $wait_time
    attempt=$((attempt + 1))
  done

  echo "❌ Timeout waiting for resources after $max_attempts attempts"
  return 1
}

# Function to deploy resources with retries
deploy_resources() {
  local max_retries=3
  local retry=1

  while [ $retry -le $max_retries ]; do
    echo "📦 Deploying resources (attempt $retry of $max_retries)..."

    if pnpm run cdk:deploy:resources:ci; then
      echo "✅ Resources deployed successfully!"
      return 0
    fi

    echo "⚠️ Deployment failed, retrying in 10 seconds..."
    sleep 10
    retry=$((retry + 1))
  done

  echo "❌ Failed to deploy resources after $max_retries attempts"
  return 1
}

# Run preflight checks to see if resources exist
echo "🔍 Running initial AWS preflight checks..."
if ! pnpm run aws:preflight; then
  echo "📢 Resources not found, starting infrastructure deployment..."

  # Deploy network infrastructure first if it doesn't exist
  echo "🌐 Checking network infrastructure..."
  if ! pnpm run cdk:deploy:network; then
    echo "⚠️ Network deployment failed, assuming network exists and proceeding..."
  fi

  # Deploy AWS resources with retries
  if ! deploy_resources; then
    echo "❌ Failed to deploy AWS resources"
    exit 1
  fi

  echo "⏳ Waiting for AWS resources to be ready..."
  if ! wait_for_resources; then
    echo "❌ Resource verification failed after maximum attempts"
    exit 1
  fi
fi

echo "⚙️ Fetching AWS configuration..."
if ! pnpm --silent aws:env >.env.production; then
  echo "❌ Failed to fetch AWS configuration"
  exit 1
fi

echo "🏗️ Building Next.js application..."
pnpm build
