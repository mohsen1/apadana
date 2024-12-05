#! /bin/bash

# Build for production. This script assumes all of the environment variables are set.
# for build process to work, the following commands must be run

# if The following environment variable is not set, exit
variables=(
  NEXT_PUBLIC_DOMAIN
  NEXT_PUBLIC_API_URL
  GOOGLE_MAPS_API_KEY
  NEXT_PUBLIC_S3_UPLOAD_BUCKET
  NEXT_PUBLIC_S3_UPLOAD_REGION
  RESEND_API_KEY
  S3_UPLOAD_KEY
  S3_UPLOAD_SECRET
)

for variable in "${variables[@]}"; do
  if [ -z "${!variable}" ]; then
    echo "$variable is not set"
    exit 1
  fi
done

pnpm prisma generate --no-hints
pnpm prisma migrate deploy
pnpm next build
