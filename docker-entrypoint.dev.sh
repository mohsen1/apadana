#!/bin/bash

# Forward SIGTERM to child processes
trap 'kill -TERM $PID' TERM INT

# Function to install dependencies
install_deps() {
    echo "📦 Installing dependencies..."
    pnpm install --prefer-offline --frozen-lockfile --reporter=append-only
    pnpm prisma generate
    touch node_modules
}

# Initial installation if needed
if [ ! -d "node_modules" ] || [ "package.json" -nt "node_modules" ]; then
    install_deps
fi

# Start watching package.json in the background
(
    while true; do
        inotifywait -e modify,create,delete,move /app/package.json
        echo "📦 Package.json changed. Reinstalling dependencies..."
        install_deps
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
