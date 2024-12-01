#!/bin/bash

# Function to install dependencies
install_deps() {
    echo "📦 Installing dependencies..."
    pnpm install
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

# Start the application with the passed command
exec "$@"
