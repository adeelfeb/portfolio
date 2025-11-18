#!/bin/bash
# Start script for Next.js server with proper hostname binding
HOSTNAME=${HOSTNAME:-0.0.0.0}
PORT=${PORT:-8000}

exec next start --hostname "$HOSTNAME" --port "$PORT"

