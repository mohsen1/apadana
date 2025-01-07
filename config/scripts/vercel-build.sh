#!/bin/bash
set -e

echo "Starting Vercel build process..."

# Check environment
if [ -z "$VERCEL_ENV" ]; then
  echo "Error: VERCEL_ENV is not set"
  exit 1
fi

# Ensure AWS credentials
if [ -z "$AWS_ACCESS_KEY_ID" ] || [ -z "$AWS_SECRET_ACCESS_KEY" ]; then
  echo "Error: Missing AWS credentials in Vercel environment"
  exit 1
fi

# If AWS_REGION not set, default it
: "${AWS_REGION:=us-east-1}"

# Map Vercel env to deployment env
if [ "$VERCEL_ENV" = "preview" ]; then
  export AWS_DEPLOYMENT_STACK_ENV="preview"
elif [ "$VERCEL_ENV" = "development" ]; then
  export AWS_DEPLOYMENT_STACK_ENV="development"
else
  export AWS_DEPLOYMENT_STACK_ENV="production"
fi

echo "Using AWS_DEPLOYMENT_STACK_ENV=$AWS_DEPLOYMENT_STACK_ENV, AWS_REGION=$AWS_REGION"

# Function to deploy resources and wait for them
deploy_and_wait() {
  echo "🚀 Deploying AWS resources..."
  pnpm cdk:deploy:resources:ci || {
    echo "❌ Resource deployment failed"
    exit 1
  }

  echo "⏳ Waiting for resources to be ready..."
  pnpm aws:wait-resources || {
    echo "❌ Timed out waiting for AWS resources"
    exit 1
  }
}

# Function to check resources and deploy if needed
check_and_deploy() {
  local max_attempts=3
  local attempt=1

  while [ $attempt -le $max_attempts ]; do
    echo "🔍 Checking existing resources (Attempt $attempt/$max_attempts)..."

    if pnpm aws:preflight; then
      echo "✅ All resources are available and configured correctly"
      return 0
    else
      echo "⚠️ Some resources are missing or not properly configured"

      if [ $attempt -lt $max_attempts ]; then
        echo "🔄 Deploying missing resources..."
        deploy_and_wait

        echo "⏳ Waiting 30 seconds before next check..."
        sleep 30
      fi
    fi

    attempt=$((attempt + 1))
  done

  echo "❌ Failed to ensure all resources are available after $max_attempts attempts"
  exit 1
}

# Check resources and deploy if needed
check_and_deploy

# Generate .env
echo "📝 Generating .env configuration..."
pnpm aws:env >.env.production

# Build Next.js
echo "🏗️ Building Next.js application..."
pnpm build
