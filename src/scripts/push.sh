#!/bin/bash

# if git status is not clean, exit
if ! git diff --quiet; then
  echo "Git status is not clean. Please commit your changes before running this script."
  exit 1
fi

# if in main branch, exit
if git rev-parse --abbrev-ref HEAD | grep -q 'main'; then
  echo "You are in the main branch. Please switch to another branch before running this script."
  exit 1
fi

# Get current directory name and parent directory
current_dir=$(basename "$(pwd)")
parent_dir=$(dirname "$(pwd)")
ci_dir="${parent_dir}/${current_dir}-ci"

# Create CI directory if it doesn't exist
mkdir -p "${ci_dir}"

# Sync files to CI directory
rsync -av --exclude-from=.gitignore . "${ci_dir}/"

# Copy dotfiles (.git, .env, etc)
for dotfile in .[!.]* ..?*; do
  if [ -e "$dotfile" ]; then
    cp -r "$dotfile" "${ci_dir}/" 2>/dev/null || true
  fi
done

# Change to CI directory
cd "${ci_dir}" || exit 1

# Configure git to push to origin
git config --global push.autoSetupRemote true

# Get current branch name
current_branch=$(git rev-parse --abbrev-ref HEAD)

# Run tests in background and save PID
(task local-ci:run && git push origin "${current_branch}") &
test_pid=$!

# Switch to main branch
git checkout main

echo "Tests running in background. You can switch to another branch and start new work."

# Change back to parent directory
cd "${parent_dir}" || exit 1

# Wait for tests to complete
wait $test_pid
test_status=$?

# Check test exit status
if [ $test_status -ne 0 ]; then
  echo "Tests failed. Please fix the issues and try again."
  exit 1
fi

echo "Tests passed and changes pushed successfully."
exit 0
