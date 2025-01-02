#!/bin/bash
set -e

echo "🚀 Starting Vercel build process..."

# Check for required environment variables
if [ -z "$AWS_ACCESS_KEY_ID" ] || [ -z "$AWS_SECRET_ACCESS_KEY" ]; then
  echo "❌ Error: Required AWS credentials not set"
  exit 1
fi

# Deploy AWS resources
echo "📦 Deploying AWS resources..."
STACK_TYPE=resources pnpm cdk deploy --all --require-approval never --app 'tsx config/aws-setup/cdk.ts' || {
  echo "❌ Failed to deploy AWS resources"
  exit 1
}

echo "🔑 Fetching AWS configuration..."
pnpm --silent aws:env >.env.production || {
  echo "❌ Failed to fetch AWS configuration"
  exit 1
}

# Verify that we got the required values
required_vars=(
  "DATABASE_URL"
  "DB_PASSWORD"
  "REDIS_URL"
  "S3_BUCKET"
  "NEXT_PUBLIC_S3_UPLOAD_BUCKET"
  "NEXT_PUBLIC_S3_UPLOAD_REGION"
  "S3_UPLOAD_KEY"
  "S3_UPLOAD_SECRET"
)

for var in "${required_vars[@]}"; do
  if ! grep -q "^${var}=" $ENV_FILE; then
    echo "❌ Error: Missing required configuration value: ${var}"
    echo "content of $ENV_FILE:\n$(cat $ENV_FILE)"
    exit 1
  fi
done

# Copy the environment file to .env.production for Next.js build
cp $ENV_FILE .env.production

echo "🏗️ Building Next.js application..."
pnpm build

echo "✅ Build process completed successfully"
