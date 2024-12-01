#!/bin/bash

# install dependencies if package.json has changed
if [ ! -d "node_modules" ] || [ "package.json" -nt "node_modules" ]; then
    echo "📦 Dependencies need to be installed/updated..."
    pnpm install
    pnpm prisma generate
    touch node_modules
fi

# Start the application with the passed command
exec "$@"
