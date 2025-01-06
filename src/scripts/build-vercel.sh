#! /bin/bash

# Build for production. This script assumes all of the environment variables are set.
# for build process to work, the following commands must be run

# deploy aws resources
export AWS_DEPLOYMENT_STACK_ENV=$VERCEL_ENV
export CDK_DEFAULT_ACCOUNT=$(echo $AWS_ACCESS_KEY_ID | cut -d '_' -f1)

echo "Deploying AWS resources for '$AWS_DEPLOYMENT_STACK_ENV' environment with account '$CDK_DEFAULT_ACCOUNT' in $AWS_REGION region"

# Deploy AWS resources
pnpm cdk:deploy --all --require-approval never --concurrency 5

# Create minimal .env with required variables
echo "NEXT_PUBLIC_AWS_REGION=$AWS_REGION" >.env
echo "NEXT_PUBLIC_AWS_S3_BUCKET_NAME=ap-$AWS_DEPLOYMENT_STACK_ENV-$CDK_DEFAULT_ACCOUNT-$AWS_REGION" >>.env

# Enable exporting of all sourced variables
set -o allexport
source .env
set +o allexport

# Generate Prisma client
pnpm prisma generate --no-hints --schema=src/prisma/schema.prisma

# Deploy Prisma migrations
pnpm prisma migrate deploy --schema=src/prisma/schema.prisma

# Build Next.js app
pnpm next build
