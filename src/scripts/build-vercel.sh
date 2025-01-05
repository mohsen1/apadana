#! /bin/bash

# Build for production. This script assumes all of the environment variables are set.
# for build process to work, the following commands must be run

# if The following environment variable is not set, exit
variables=(
  NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
  RESEND_API_KEY
  NEXT_PUBLIC_S3_UPLOAD_BUCKET
  NEXT_PUBLIC_S3_UPLOAD_REGION
  S3_UPLOAD_KEY
  S3_UPLOAD_SECRET
)

# deploy aws resources
export AWS_DEPLOYMENT_STACK_ENV=$VERCEL_ENV
export CDK_DEFAULT_ACCOUNT=$AWS_ACCOUNT_ID
echo "Deploying AWS resources for '$AWS_DEPLOYMENT_STACK_ENV' environment with account '$CDK_DEFAULT_ACCOUNT' in $AWS_REGION region"
pnpm cdk:deploy --all --require-approval never --concurrency 5

# Generating .env file from AWS resources
pnpm cdk:print-values >.env

# Make some AWS environment variables available to the build process
echo "NEXT_PUBLIC_AWS_REGION=$AWS_REGION" >>.env
NEXT_PUBLIC_AWS_S3_BUCKET_NAME=$(grep AWS_S3_BUCKET_NAME .env | cut -d '=' -f2)
echo "NEXT_PUBLIC_AWS_S3_BUCKET_NAME=$NEXT_PUBLIC_AWS_S3_BUCKET_NAME" >>.env

for variable in "${variables[@]}"; do
  if [ -z "${!variable}" ]; then
    echo "$variable is not set"
    exit 1
  fi
done

pnpm prisma generate --no-hints --schema=src/prisma/schema.prisma
pnpm prisma migrate deploy --schema=src/prisma/schema.prisma
pnpm next build
