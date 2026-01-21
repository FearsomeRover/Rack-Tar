#!/bin/bash
set -e

echo "=== Racktar Deployment Script ==="

cd "$(dirname "$0")"

# Check if .env.production exists
if [ ! -f .env.production ]; then
    echo "Error: .env.production not found!"
    echo "Copy .env.production.template to .env.production and fill in the values."
    exit 1
fi

# Load environment variables
export $(grep -v '^#' .env.production | xargs)

echo "Pulling latest changes..."
git pull origin main

echo "Stopping existing containers..."
docker compose down

echo "Building new image..."
docker compose build --no-cache

echo "Starting containers..."
docker compose up -d

echo "Waiting for database to be ready..."
sleep 5

echo "Running database migrations..."
docker compose exec -T app npx prisma migrate deploy 2>/dev/null || \
docker compose exec -T app npx prisma db push --accept-data-loss

echo "=== Deployment complete! ==="
echo "App running at http://localhost:3000"
docker compose ps
