#! /bin/bash

# Build for production. This script assumes all of the environment variables are set.
# for build process to work, the following commands must be run

# if The following environment variable is not set, exit
variables=(
  GOOGLE_MAPS_API_KEY
  RESEND_API_KEY
  NEXT_PUBLIC_S3_UPLOAD_BUCKET
  NEXT_PUBLIC_S3_UPLOAD_REGION
  S3_UPLOAD_KEY
  S3_UPLOAD_SECRET
)

# set the domain to the vercel url. this value is dynamic and changes on each deploy depending on the environment

export NEXT_PUBLIC_DOMAIN="https://$VERCEL_URL"

for variable in "${variables[@]}"; do
  if [ -z "${!variable}" ]; then
    echo "$variable is not set"
    exit 1
  fi
done

pnpm prisma generate --no-hints --schema=src/prisma/schema.prisma
pnpm prisma migrate deploy --schema=src/prisma/schema.prisma
pnpm next build
