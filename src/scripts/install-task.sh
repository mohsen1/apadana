#!/bin/bash

# if already installed, exit
if command -v task &>/dev/null; then
  exit 0
fi

# Create .local/bin directory if it doesn't exist
mkdir -p ~/.local/bin

# install task depending on the OS
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
  # Check if we're in Vercel environment
  if [ -n "$VERCEL" ]; then
    # Direct binary download for Vercel environment
    curl -sL https://github.com/go-task/task/releases/download/v3.30.1/task_linux_amd64.tar.gz | tar xz -C ~/.local/bin
    chmod +x ~/.local/bin/task
  else
    sh -c "$(curl --location https://taskfile.dev/install.sh)" -- -d -b ~/.local/bin
  fi
elif [[ "$OSTYPE" == "darwin"* ]]; then
  brew install go-task/tap/go-task
fi

# Ensure ~/.local/bin is in PATH
export PATH="$HOME/.local/bin:$PATH"

# Verify installation
if ! command -v task &>/dev/null; then
  echo "Failed to install task"
  exit 1
fi
