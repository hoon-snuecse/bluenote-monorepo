#!/bin/bash
set -e

echo "Starting Vercel build process for Quiz app..."

# Navigate to monorepo root
cd ../..

# Install dependencies
echo "Installing dependencies..."
pnpm install

# Build the quiz app
echo "Building Quiz app..."
pnpm build --filter=quiz

echo "Build complete!"