#!/bin/bash

# if already installed, exit
if command -v task &>/dev/null; then
  exit 0
fi

# install task depending on the OS
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
  sudo apt-get install task
elif [[ "$OSTYPE" == "darwin"* ]]; then
  brew install go-task/tap/go-task
fi
