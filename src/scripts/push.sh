#!/bin/bash

set -e

# if git status is not clean, exit
if ! git diff --quiet; then
  echo "Git status is not clean. Please commit your changes before running this script."
  exit 1
fi

# Get current branch name
current_branch=$(git rev-parse --abbrev-ref HEAD)

# if in main branch, exit
if [ "$current_branch" = "main" ]; then
  echo "You are in the main branch. Please switch to another branch before running this script."
  exit 1
fi

# Get current directory name and parent directory
current_dir=$(basename "$(pwd)")
parent_dir=$(dirname "$(pwd)")
ci_dir="${parent_dir}/${current_dir}-ci"

# Create a unique log file
log_file="/tmp/push-${current_branch}-$(date +%s).log"

# Cleanup function
cleanup() {
  cd "$parent_dir/$current_dir" || exit 1
}

# Set up trap for cleanup
trap cleanup EXIT INT TERM

# Create CI directory if it doesn't exist
mkdir -p "${ci_dir}"

# Sync changes to CI directory
rsync -a --exclude='node_modules' . "${ci_dir}/"

# Switch to CI directory
cd "${ci_dir}" || exit 1

mkdir -p "$(dirname "$log_file")"
touch "$log_file"
echo "Starting background process..."
echo "Log file: $log_file"

# Run the long operations in background
{
  # Install dependencies
  if ! pnpm install >"$log_file" 2>&1; then
    cat "$log_file"
    echo "Failed to install dependencies. for branch: $current_branch"
    exit 1
  fi

  if ! task local-ci:run >>"$log_file" 2>&1; then
    cat "$log_file"
    echo "Tests failed. for branch: $current_branch"
    exit 1
  fi

  if ! git push origin "${current_branch}" >>"$log_file" 2>&1; then
    cat "$log_file"
    echo "Failed to push changes. for branch: $current_branch"
    exit 1
  fi

  echo "Tests passed and changes pushed successfully. for branch: $current_branch"
} &
