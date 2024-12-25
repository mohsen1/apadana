#!/usr/bin/env sh
set -e

# Forward SIGTERM to child processes
trap 'kill -TERM $PID' TERM INT

echo "[docker-entrypoint.prod.sh] Starting placeholder server on port 3030..."
http-server /app/src/docker/placeholder-server -p 3030 --silent &
PLACEHOLDER_PID=$!

echo "[docker-entrypoint.prod.sh] Building production server..."

pnpm exec next telemetry disable

pnpm build &&
  pnpm prisma:migrate &&
  pnpm prisma db seed

echo "[docker-entrypoint.prod.sh] Killing placeholder server..."
kill $PLACEHOLDER_PID || true

echo "[docker-entrypoint.prod.sh] Setup complete, ready to start server..."

# Execute the command passed to the container
exec "$@"
