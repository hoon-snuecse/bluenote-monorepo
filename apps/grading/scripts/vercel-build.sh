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

# Verify Prisma client generation
echo "=== Verifying Prisma client generation ==="
if [ -d "../../node_modules/.prisma/client" ]; then
  echo "✓ Prisma client found at monorepo root"
  ls -la ../../node_modules/.prisma/client/
elif [ -d "node_modules/.prisma/client" ]; then
  echo "✓ Prisma client found in app directory"
  ls -la node_modules/.prisma/client/
else
  echo "✗ Prisma client not found!"
  echo "Attempting to locate Prisma client..."
  find ../.. -name ".prisma" -type d 2>/dev/null | head -10
fi

# Build the app
echo "Building Next.js app..."
pnpm build