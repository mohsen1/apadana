#!/usr/bin/env bash
set -euo pipefail

: "${PR_NUMBER:?PR_NUMBER environment variable not set}"

DB_INSTANCE_IDENTIFIER="apadana-pr-${PR_NUMBER}"

# Delete the DB instance
aws rds delete-db-instance \
  --db-instance-identifier "$DB_INSTANCE_IDENTIFIER" \
  --skip-final-snapshot \
  --delete-automated-backups

# Wait for deletion to complete
aws rds wait db-instance-deleted --db-instance-identifier "$DB_INSTANCE_IDENTIFIER"
