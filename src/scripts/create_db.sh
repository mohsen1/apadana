#!/usr/bin/env bash
set -euo pipefail

# Validate required environment variables
: "${PR_NUMBER:?PR_NUMBER environment variable not set}"
: "${SNAPSHOT_IDENTIFIER:?SNAPSHOT_IDENTIFIER environment variable not set}"
: "${MASTER_USERNAME:?MASTER_USERNAME environment variable not set}"
: "${MASTER_PASSWORD:?MASTER_PASSWORD environment variable not set}"

DB_INSTANCE_IDENTIFIER="apadana-pr-${PR_NUMBER}"
DB_NAME="apadana"

# Create new DB instance from snapshot
aws rds restore-db-instance-from-db-snapshot \
  --db-instance-identifier "$DB_INSTANCE_IDENTIFIER" \
  --db-snapshot-identifier "$SNAPSHOT_IDENTIFIER" \
  --db-instance-class "db.t3.micro" \
  --db-subnet-group-name "apadana-subnet-group" \
  --no-multi-az \
  --publicly-accessible \
  --vpc-security-group-ids "sg-09572c51084e7165c" \
  --tags Key=Environment,Value=PR-"$PR_NUMBER"

# Wait for DB instance to be available
aws rds wait db-instance-available --db-instance-identifier "$DB_INSTANCE_IDENTIFIER"

# Get the endpoint
DB_HOST=$(aws rds describe-db-instances \
  --db-instance-identifier "$DB_INSTANCE_IDENTIFIER" \
  --query 'DBInstances[0].Endpoint.Address' \
  --output text)

DB_URL="postgresql://${MASTER_USERNAME}:${MASTER_PASSWORD}@${DB_HOST}:5432/${DB_NAME}"

echo "db_url=$DB_URL"
