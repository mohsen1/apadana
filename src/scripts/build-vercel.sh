#!/bin/bash

# Build for production. This script assumes all of the environment variables are set.
# for build process to work, the following commands must be run

export AWS_DEPLOYMENT_STACK_ENV=$VERCEL_ENV
export CDK_DEFAULT_ACCOUNT=$(echo $AWS_ACCESS_KEY_ID | cut -d '_' -f1)

echo "Deploying AWS resources for '$AWS_DEPLOYMENT_STACK_ENV' environment with account '$CDK_DEFAULT_ACCOUNT' in $AWS_REGION region"

# Deploy AWS resources
pnpm cdk:deploy --all --require-approval never --concurrency 5

# Install Vercel CLI
echo "Installing Vercel CLI..."
pnpm add -g vercel@latest

# Get AWS environment variables and set them in Vercel
echo "Setting AWS environment variables in Vercel..."
pnpm run --silent cdk:print-values | while IFS='=' read -r key value; do
  echo "$value" | vercel env add "$key" "$VERCEL_ENV" --force
done

# Get DATABASE_URL from AWS Secrets Manager
echo "Getting DATABASE_URL from AWS Secrets Manager..."
SECRET_NAME=$(aws secretsmanager list-secrets --query "SecretList[?Name=='ap-rds-secret-${AWS_DEPLOYMENT_STACK_ENV}'].Name" --output text)
if [ -n "$SECRET_NAME" ]; then
  SECRET_VALUE=$(aws secretsmanager get-secret-value --secret-id "$SECRET_NAME" --query SecretString --output text)
  export DATABASE_URL="postgresql://$(echo $SECRET_VALUE | jq -r '.username'):$(echo $SECRET_VALUE | jq -r '.password')@$(aws rds describe-db-instances --db-instance-identifier ap-rds-${AWS_DEPLOYMENT_STACK_ENV} --query 'DBInstances[0].Endpoint.Address' --output text):5432/ap_db"
fi

# Generate Prisma client
pnpm prisma generate --no-hints --schema=src/prisma/schema.prisma

# Deploy Prisma migrations
pnpm prisma migrate deploy --schema=src/prisma/schema.prisma

# Build Next.js app
pnpm next build
