#!/bin/bash

# Production deployment script

set -e

echo "🚀 Starting production deployment..."

# Check if production environment file exists
if [ ! -f .env.production ]; then
    echo "❌ Error: .env.production file not found"
    echo "Please create .env.production from .env.example and configure it"
    exit 1
fi

# Load production environment
cp .env.production .env

# Build the application
echo "📦 Building application..."
npm run build

# Run database migrations
echo "🗄️ Running database migrations..."
npx prisma migrate deploy

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

# Build Docker image
echo "🐳 Building Docker image..."
docker build -t grading-app:latest .

# Run with Docker Compose
echo "🚢 Starting services with Docker Compose..."
docker-compose up -d

# Check deployment status
echo "✅ Deployment complete!"
echo "🌐 Application is running at http://localhost:3000"
echo ""
echo "📝 Post-deployment checklist:"
echo "  - Check application logs: docker-compose logs -f app"
echo "  - Verify database connection: docker-compose exec app npx prisma studio"
echo "  - Create admin user: docker-compose exec app npm run db:seed"