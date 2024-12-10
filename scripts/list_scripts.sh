#!/bin/bash
# Bash script to recursively print file paths and contents of all files in the scripts/ directory

find scripts/ -type f | while read -r file; do
  # if file is not .yml, skip
  if [[ "$file" != *.yml ]]; then
    continue
  fi
  echo "File: $file"
  cat "$file"
  echo "" # Add an empty line for readability
done
