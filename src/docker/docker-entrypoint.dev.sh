#!/bin/bash

echo "[docker-entrypoint.dev.sh] Starting docker entrypoint"

# Forward SIGTERM to child processes and ensure cleanup
cleanup() {
    echo "[docker-entrypoint.dev.sh] Cleaning up processes..."
    kill $PID $WATCH_PID 2>/dev/null
    exit 0
}

trap cleanup TERM INT

# Function to validate package.json
validate_package_json() {
    if ! jq '.' package.json >/dev/null 2>&1; then
        echo "[docker-entrypoint.dev.sh] ⚠️ Invalid package.json detected. Restoring from backup..."
        if [ -f "package.json.backup" ]; then
            cp package.json.backup package.json
            return 0
        else
            return 1
        fi
    fi
    return 0
}

# Function to install dependencies
install_deps() {
    echo "[docker-entrypoint.dev.sh] 📦 Installing dependencies..."
    # Create backup before installation
    cp package.json package.json.backup
    if ! validate_package_json; then
        echo "[docker-entrypoint.dev.sh] ❌ Fatal: package.json is invalid and no backup exists"
        return 1
    fi
    # Remove --force flag and keep --prefer-offline for better caching
    pnpm install --prefer-offline --reporter=append-only
    pnpm prisma generate --schema=src/prisma/schema.prisma
    touch node_modules/.install-stamp
}

# Initial installation if needed
if [ ! -f "node_modules/.install-stamp" ] || [ "pnpm-lock.yaml" -nt "node_modules/.install-stamp" ]; then
    install_deps
fi

# Function to handle Prisma schema changes
handle_prisma_change() {
    echo "[docker-entrypoint.dev.sh] 🔄 Prisma schema changed, regenerating to migrate..."
    pnpm prisma generate --schema=src/prisma/schema.prisma
    # Kill the dev server to trigger restart
    kill $PID 2>/dev/null
    # Start the application again
    exec "$@" &
    PID=$!
}

# Watch only lock file and prisma schema
(
    while true; do
        changed_file=$(inotifywait -e modify,create,delete,move -q \
            /app/pnpm-lock.yaml \
            /app/src/prisma/schema.prisma 2>watch_error.log)

        if [ $? -ne 0 ]; then
            echo "[docker-entrypoint.dev.sh] ⚠️ Error watching files:"
            cat watch_error.log
            echo "[docker-entrypoint.dev.sh] Retrying in 5 seconds..."
            sleep 5
            continue
        fi

        # Check which file changed
        if [[ "$changed_file" == *"/app/src/prisma/schema.prisma"* ]]; then
            handle_prisma_change "$@"
        elif [[ "$changed_file" == *"/app/pnpm-lock.yaml"* ]]; then
            echo "[docker-entrypoint.dev.sh] 📦 Lock file changed, installing dependencies..."
            # Add small delay to ensure file write is complete
            sleep 1
            if ! install_deps 2>deps_error.log; then
                echo "[docker-entrypoint.dev.sh] ⚠️ Error installing dependencies:"
                cat deps_error.log
            fi
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
