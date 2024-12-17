#!/usr/bin/env bash

# This script is used to run a script in the src/scripts directory
# It will source the .env.local file and run the script with the provided arguments
#
# How to use:
# ./local-run.sh <script-name> [arguments...]
#
# Available scripts:
# - determine_action.sh
# - create_db.sh
# - run_migrations.sh
# - delete_db.sh
#
# Example:
# ./local-run.sh create_db.sh

set -euo pipefail

# Check if script name is provided
if [ $# -eq 0 ]; then
  echo "Usage: $0 <script-name> [arguments...]"
  echo "Available scripts:"
  echo "  - determine_action.sh"
  echo "  - create_db.sh"
  echo "  - run_migrations.sh"
  echo "  - delete_db.sh"
  exit 1
fi

SCRIPT_NAME="$1"
shift # Remove the first argument, leaving remaining args

# Source the local environment variables
source "$(dirname "$0")/.env.local"

# Run the requested script with any additional arguments
"$(dirname "$0")/${SCRIPT_NAME}" "$@"
