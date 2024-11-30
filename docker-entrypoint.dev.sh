#!/bin/bash

# Function to install dependencies if package.json has changed
check_and_install_deps() {
    if [ ! -d "node_modules" ] || [ "package.json" -nt "node_modules" ]; then
        echo "📦 Dependencies need to be installed/updated..."
        pnpm install
        pnpm prisma generate
        touch node_modules
    fi
}

# Initial dependency check
check_and_install_deps

# Start the application with the passed command
exec "$@" 