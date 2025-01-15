#!/bin/bash
# Exit on error
set -e

# Install task
mkdir -p ~/.local/bin
curl -sL https://github.com/go-task/task/releases/download/v3.30.1/task_linux_amd64.tar.gz | tar xz -C /tmp
chmod +x /tmp/task
mv /tmp/task ~/.local/bin/task
export PATH="$HOME/.local/bin:$PATH"

# This is essentially a postinstall
task prisma:generate

# Set AWS deployment environment based on Vercel environment
export AWS_DEPLOYMENT_STACK_ENV="${VERCEL_ENV:-development}"

# Build for production. This script assumes all of the environment variables are set.
echo "Deploying AWS resources for '$AWS_DEPLOYMENT_STACK_ENV' environment in $AWS_REGION region"

# Run preflight checks
echo "Running preflight checks..."
task cdk:preflight || exit 1

task cdk:deploy-ci

# Install Vercel CLI
echo "Installing Vercel CLI..."
export AVOID_UPDATE_NOTIFIER="1"
npm install --global --silent vercel@39.2.6

# Get AWS environment variables and set them in Vercel
echo "Setting AWS environment variables in Vercel..."
task cdk:env

cat /tmp/deployment-values.env | while IFS='=' read -r key value; do
  # Trim the value to remove any whitespace or newlines
  value=$(echo "$value" | tr -d '\n' | xargs)
  # Write the environment variable to a temporary file.
  # This is done because of how Vercel CLI handles environment variables.
  filename="/tmp/__TEMP_ENV_VAR__$key.env"
  # Only write the value part, not the key=value format
  echo -n "$value" >$filename
  cat $filename | vercel env add "$key" "$VERCEL_ENV" --force --token "$VERCEL_TOKEN"
  rm -f $filename
  # Export the environment variable to the current shell session for the build script to use.
  export $key="$value"
done

# Wait for resources to be ready
echo "Waiting for AWS resources to be ready..."
task cdk:wait

# Deploy Prisma migrations
echo "Deploying database migrations..."
task prisma:migrate

# In preview run seed
if [ "$VERCEL_ENV" == "preview" ]; then
  task dev:prisma:seed
fi

# Build Next.js app
echo "Building Next.js application..."
task build
