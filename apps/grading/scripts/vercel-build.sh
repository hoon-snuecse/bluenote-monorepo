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
# Find and remove any existing prisma clients
find ../.. -name ".prisma" -type d -exec rm -rf {} + 2>/dev/null || true

# Generate fresh Prisma client
npx prisma generate --schema=./prisma/schema.prisma

# Create symlink if needed
if [ ! -d "node_modules/@prisma/client" ] && [ -d "../../node_modules/@prisma/client" ]; then
  mkdir -p node_modules/@prisma
  ln -s ../../../../node_modules/@prisma/client node_modules/@prisma/client
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