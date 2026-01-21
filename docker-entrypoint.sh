#!/bin/sh
set -e

echo "Running database migrations..."
npx prisma db push --skip-generate --accept-data-loss 2>/dev/null || echo "Migration completed or skipped"

echo "Starting application..."
exec node server.js
