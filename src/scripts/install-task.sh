#!/bin/bash

# if already installed, exit
if command -v task &>/dev/null; then
  exit 0
fi

# install task depending on the OS
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
  sh -c "$(curl --location https://taskfile.dev/install.sh)" -- -d -b ~/.local/bin
elif [[ "$OSTYPE" == "darwin"* ]]; then
  brew install go-task/tap/go-task
fi

# Verify installation
if ! command -v task &>/dev/null; then
  echo "Failed to install task"
  exit 1
fi
