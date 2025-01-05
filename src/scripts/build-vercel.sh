#! /bin/bash

# Build for production. This script assumes all of the environment variables are set.
# for build process to work, the following commands must be run

# deploy aws resources
export AWS_DEPLOYMENT_STACK_ENV=$VERCEL_ENV
export CDK_DEFAULT_ACCOUNT=$AWS_ACCESS_KEY_ID_ID
echo "Deploying AWS resources for '$AWS_DEPLOYMENT_STACK_ENV' environment with account '$CDK_DEFAULT_ACCOUNT' in $AWS_REGION region"
pnpm cdk:deploy --all --require-approval never --concurrency 5

# Create .env file
# Create .env and populate with deployment values
echo "Creating .env file..."
if ! pnpm tsx src/aws-setup/scripts/print-deployment-values.ts >.env; then
  echo "Error generating deployment values"
  exit 1
fi

if [ ! -s .env ]; then
  echo "Error: .env file is empty"
  exit 1
fi

# Make some AWS environment variables available to the build process
echo "Adding AWS environment variables..."
echo "NEXT_PUBLIC_AWS_REGION=$AWS_REGION" >>.env
NEXT_PUBLIC_AWS_S3_BUCKET_NAME=$(grep AWS_S3_BUCKET_NAME .env | cut -d '=' -f2)
echo "NEXT_PUBLIC_AWS_S3_BUCKET_NAME=$NEXT_PUBLIC_AWS_S3_BUCKET_NAME" >>.env

# Load required environment variables from .env file
echo "Loading environment variables..."
while IFS='=' read -r key value; do
  if [ -n "$key" ] && [ -n "$value" ]; then
    export "$key=$value"
  fi
done <.env

variables=(
  NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
  RESEND_API_KEY
  AWS_ACCESS_KEY_ID
  AWS_SECRET_ACCESS_KEY
  AWS_REGION
  NEXT_PUBLIC_AWS_S3_BUCKET_NAME
  NEXT_PUBLIC_AWS_REGION
)
for variable in "${variables[@]}"; do
  if [ -z "${!variable}" ]; then
    echo "$variable is not set"
    exit 1
  fi
done

pnpm prisma generate --no-hints --schema=src/prisma/schema.prisma
pnpm prisma migrate deploy --schema=src/prisma/schema.prisma
pnpm next build
