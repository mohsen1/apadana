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

# Cleanup function
cleanup() {
  echo "Cleaning up..."
  rm -f "$temp_output"
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

# Run tests
temp_output=$(mktemp)
echo "Running tests and pushing changes..."

# Install dependencies only if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
  echo "Installing dependencies..."
  if ! pnpm install >"$temp_output" 2>&1; then
    cat "$temp_output"
    echo "Failed to install dependencies"
    exit 1
  fi
fi

if ! task local-ci:run >"$temp_output" 2>&1; then
  cat "$temp_output"
  echo "Tests failed"
  exit 1
fi

if ! git push origin "${current_branch}" >>"$temp_output" 2>&1; then
  cat "$temp_output"
  echo "Failed to push changes"
  exit 1
fi

echo "Tests passed and changes pushed successfully."
exit 0
