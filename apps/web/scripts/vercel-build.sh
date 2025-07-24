#!/bin/bash
set -e

echo "Starting Vercel build process for Web app..."

# Navigate to monorepo root
cd ../..

# Install dependencies
echo "Installing dependencies..."
pnpm install

# Navigate back to web app
cd apps/web

# Build the app
echo "Building Next.js app..."
pnpm build

echo "Build completed successfully!"