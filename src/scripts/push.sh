#!/bin/bash

set -e

# Get current directory name and parent directory
current_dir=$(basename "$(pwd)")
parent_dir=$(dirname "$(pwd)")
ci_dir="${parent_dir}/${current_dir}-ci"

# Check if another instance is running
if [ -f "${ci_dir}/push-lock.txt" ]; then
  echo "Another instance of this script is already running. Please wait for it to complete."
  exit 1
fi

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

# Create a unique log file
log_file="/tmp/push-${current_branch}-$(date +%s).log"

# Cleanup function
cleanup() {
  rm -f "$lock_file"
  cd "$parent_dir/$current_dir" || exit 1
}

fail() {
  rm -f "$lock_file"

  osascript -e 'display notification "'"$1"'" with title "Push to '"$current_branch"' failed."'
  code "$log_file"
  exit 1
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
  # Create a lock file to prevent multiple instances from running
  lock_file="${ci_dir}/push-lock.txt"
  echo "Test logs for branch: $current_branch" >"$lock_file"
  echo "Started at: $(date)" >>"$lock_file"

  cat "$lock_file" >>"$log_file"
  echo "" >>"$log_file"

  # Install dependencies
  echo "Installing dependencies..." >>"$log_file"
  if ! pnpm install >>"$log_file" 2>&1; then
    fail "Failed to install dependencies"
  fi

  echo "Running tests..." >>"$log_file"
  if ! task local-ci >>"$log_file" 2>&1; then
    fail "Tests failed"
  fi

  echo "Pushing changes..." >>"$log_file"
  if ! git push origin "${current_branch}" >>"$log_file" 2>&1; then
    fail "Failed to push changes"
  fi

  echo "Tests passed and changes pushed successfully. for branch: $current_branch"
} &
