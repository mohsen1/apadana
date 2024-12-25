#!/bin/bash

echo "[docker-entrypoint.dev.sh] Starting docker entrypoint"

# Forward SIGTERM to child processes and ensure cleanup
cleanup() {
    echo "[docker-entrypoint.dev.sh] Cleaning up processes..."
    kill $PID $WATCH_PID 2>/dev/null
    exit 0
}

trap cleanup TERM INT

# Function to install dependencies
install_deps() {
    echo "[docker-entrypoint.dev.sh] 📦 Installing dependencies..."
    pnpm install --prefer-offline --frozen-lockfile --reporter=append-only
    pnpm prisma generate --schema=src/prisma/schema.prisma
    touch node_modules/.install-stamp
}

# Initial installation if needed
if [ ! -f "node_modules/.install-stamp" ] || [ "package.json" -nt "node_modules/.install-stamp" ]; then
    install_deps
fi

# Start watching package.json in the background with a sleep to reduce CPU usage
(
    while true; do
        if inotifywait -e modify,create,delete,move -q /app/package.json; then
            echo "[docker-entrypoint.dev.sh] 📦 package.json changed"
            install_deps
        fi
        sleep 1
    done
) &
WATCH_PID=$!

# Start the application with the passed command
exec "$@" &
PID=$!

# Wait for either process to exit
wait -n $PID $WATCH_PID

# Ensure cleanup on exit
cleanup
