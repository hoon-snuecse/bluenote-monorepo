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
rm -rf node_modules/.prisma
npx prisma generate --schema=./prisma/schema.prisma

# Verify Prisma client generation
echo "=== Verifying Prisma client generation ==="
if [ -d "node_modules/.prisma/client" ]; then
  echo "✓ Prisma client found in app directory"
  ls -la node_modules/.prisma/client/
else
  echo "✗ Prisma client not found!"
  echo "Creating fallback..."
  mkdir -p node_modules/.prisma/client
  echo "export * from '@prisma/client'" > node_modules/.prisma/client/index.js
  echo "export { PrismaClient } from '@prisma/client'" >> node_modules/.prisma/client/index.js
fi

# Build the app
echo "Building Next.js app..."
pnpm build