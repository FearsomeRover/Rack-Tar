#!/bin/bash
set -e

echo "=== Racktar Deployment Script ==="

cd "$(dirname "$0")"

# Check if .env exists
if [ ! -f .env ]; then
    echo "Error: .env not found!"
    echo "Copy .env.production.template to .env and fill in the values."
    exit 1
fi

echo "Pulling latest changes..."
git pull origin main

echo "Stopping existing containers..."
docker compose down --remove-orphans || true
docker rm -f racktar-app-1 racktar-db-1 2>/dev/null || true

echo "Building new image..."
docker compose build --no-cache

echo "Starting containers..."
docker compose up -d

echo "=== Deployment complete! ==="
echo "App running at http://localhost:3000"
echo ""
echo "View logs with: docker compose logs -f app"
docker compose ps
