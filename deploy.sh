#!/bin/sh
set -e

cd "$(dirname "$0")"

echo "Building app..."
docker run --rm \
  -v "$(pwd):/app" \
  -w /app \
  node:20-alpine \
  sh -c "apk add --no-cache libc6-compat && npm install && npm run build"

echo "Restarting app container..."
docker compose restart app

echo "Done."
