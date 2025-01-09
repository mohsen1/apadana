#!/bin/bash
set -e

echo "[docker-entrypoint.prod.sh] Starting production entrypoint script..."

BUILD_IN_PROGRESS_FILE="/tmp/build_in_progress"
ERROR_FILE="/tmp/build_error.txt"
PLACEHOLDER_PID_FILE="/tmp/placeholder.pid"

# Cleanup function
cleanup() {
  echo "[docker-entrypoint.prod.sh] Running cleanup..."
  if [ -f "$PLACEHOLDER_PID_FILE" ]; then
    echo "[docker-entrypoint.prod.sh] Stopping placeholder server..."
    kill $(cat "$PLACEHOLDER_PID_FILE") 2>/dev/null || true
    rm -f "$PLACEHOLDER_PID_FILE"
  fi
  rm -f "$BUILD_IN_PROGRESS_FILE" "$ERROR_FILE"
  echo "[docker-entrypoint.prod.sh] Cleanup complete"
}

# watch and rebuild function
function watch_and_rebuild() {
  echo "[docker-entrypoint.prod.sh] Watching for rebuild trigger..."
  touch /tmp/rebuild_trigger
  while true; do
    inotifywait -e modify -q /tmp/rebuild_trigger
    echo "[docker-entrypoint.prod.sh] Rebuild triggered, rebuilding..."
    rm -f "$ERROR_FILE" "$BUILD_IN_PROGRESS_FILE"
    if build; then
      echo "[docker-entrypoint.prod.sh] Build successful, starting main application..."
      cleanup
      return 0
    fi
  done
}

# Build function
function build() {
  rm -f "$BUILD_IN_PROGRESS_FILE" "$ERROR_FILE"
  echo "[docker-entrypoint.prod.sh] Starting build sequence..."

  # Execute commands separately to handle errors properly
  if ! bash -c "task build" >"$BUILD_IN_PROGRESS_FILE" 2>&1 ||
    ! bash -c "task prisma:migrate" >>"$BUILD_IN_PROGRESS_FILE" 2>&1 ||
    ! bash -c "task dev:prisma:seed" >>"$BUILD_IN_PROGRESS_FILE" 2>&1; then
    echo "[docker-entrypoint.prod.sh] Build failed..."
    cat "$BUILD_IN_PROGRESS_FILE" >"$ERROR_FILE"
    cat "$BUILD_IN_PROGRESS_FILE"
    return 1
  fi
  return 0
}

# Start placeholder server
echo "[docker-entrypoint.prod.sh] Starting placeholder server..."
node src/docker/placeholder-server/server.mjs &
echo $! >"$PLACEHOLDER_PID_FILE"

# Ensure cleanup on script exit
trap cleanup EXIT

# Entrypoint
if build; then
  cleanup
  task next:start
else
  # Start placeholder server first
  echo "[docker-entrypoint.prod.sh] Starting placeholder server while watching for changes..."

  # Then watch and rebuild
  watch_and_rebuild
  task next:start
fi
