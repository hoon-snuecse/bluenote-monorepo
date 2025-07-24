#!/bin/bash
set -e

echo "Starting Vercel build process for Web app..."

# Save current directory
CURRENT_DIR=$(pwd)
echo "Current directory: $CURRENT_DIR"

# Navigate to monorepo root
cd ../..
MONOREPO_ROOT=$(pwd)
echo "Monorepo root: $MONOREPO_ROOT"

# Install dependencies
echo "Installing dependencies..."
pnpm install

# Navigate back to web app using absolute path
cd "$CURRENT_DIR"
echo "Back to app directory: $(pwd)"

# Build the app
echo "Building Next.js app..."
pnpm build

echo "Build completed successfully!"
echo "Output directory contents:"
ls -la .next/ | head -10