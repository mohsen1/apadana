#!/bin/bash

echo "[docker-entrypoint.dev.sh] Starting docker entrypoint"

# Forward SIGTERM to child processes
trap 'kill -TERM $PID' TERM INT

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

# Start watching package.json in the background
(
    while true; do
        if inotifywait -e modify,create,delete,move -q /app/package.json; then
            echo "[docker-entrypoint.dev.sh] 📦 package.json changed"
            install_deps
        fi
    done
) &
WATCH_PID=$!

# Start the application with the passed command
"$@" &
PID=$!

# Wait for either process to exit
wait -n $PID $WATCH_PID

# Kill both processes on exit
kill $PID $WATCH_PID 2>/dev/null

# Clean exit
exit
