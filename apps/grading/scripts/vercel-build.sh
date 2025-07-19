#!/bin/bash
set -e

echo "Starting Vercel build process..."

# Navigate to monorepo root
cd ../..

# Install dependencies
echo "Installing dependencies..."
pnpm install

# Navigate to grading app
cd apps/grading

# Clean any existing Prisma client
echo "Cleaning existing Prisma client..."
rm -rf ../../node_modules/.prisma
rm -rf ../../node_modules/@prisma/client/.prisma
rm -rf node_modules/.prisma
rm -rf node_modules/@prisma/client/.prisma

# Generate Prisma client
echo "Generating Prisma client..."
npx prisma generate --schema=./prisma/schema.prisma

# Fix Prisma client location for pnpm
echo "Fixing Prisma client location for pnpm..."
PNPM_DIR="../../node_modules/.pnpm"
if [ -d "$PNPM_DIR" ]; then
  # Find the @prisma+client directory
  PRISMA_CLIENT_DIR=$(find $PNPM_DIR -maxdepth 1 -name "@prisma+client@*" -type d | head -1)
  
  if [ -n "$PRISMA_CLIENT_DIR" ]; then
    echo "Found pnpm Prisma client directory: $PRISMA_CLIENT_DIR"
    
    # Check if .prisma exists in the root of node_modules
    if [ -d "$PRISMA_CLIENT_DIR/node_modules/.prisma" ]; then
      echo "Found .prisma directory, copying to @prisma/client..."
      mkdir -p "$PRISMA_CLIENT_DIR/node_modules/@prisma/client"
      cp -r "$PRISMA_CLIENT_DIR/node_modules/.prisma" "$PRISMA_CLIENT_DIR/node_modules/@prisma/client/.prisma"
      echo "✓ Copied .prisma to @prisma/client directory"
    fi
  fi
fi

# Verify Prisma client generation
echo "=== Verifying Prisma client generation ==="
echo "Searching for .prisma directories..."
find ../.. -name ".prisma" -type d 2>/dev/null | while read -r prisma_dir; do
  echo "Found: $prisma_dir"
  ls -la "$prisma_dir/client/" 2>/dev/null | head -5 || true
done

# Check if @prisma/client exists
if [ -d "../../node_modules/@prisma/client" ]; then
  echo "✓ @prisma/client found at monorepo root"
elif [ -d "node_modules/@prisma/client" ]; then
  echo "✓ @prisma/client found in app directory"
else
  echo "✗ @prisma/client not found!"
fi

# Build the app
echo "Building Next.js app..."
pnpm build