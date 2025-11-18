#!/bin/bash
# Start script for Next.js server with proper hostname binding
cd "$(dirname "$0")/.." || exit 1

HOSTNAME=${HOSTNAME:-0.0.0.0}
PORT=${PORT:-8000}

exec npx next start --hostname "$HOSTNAME" --port "$PORT"

