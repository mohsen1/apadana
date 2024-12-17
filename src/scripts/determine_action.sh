#!/usr/bin/env bash
set -euo pipefail

EVENT_ACTION="${1:?Must provide event action as first argument}"

if [ "$EVENT_ACTION" = "closed" ]; then
  echo "action=delete"
else
  echo "action=create"
fi
