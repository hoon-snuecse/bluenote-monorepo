#!/bin/bash
set -e

echo "Starting Vercel build process..."

# Navigate to monorepo root
cd ../..

# Install dependencies with force flag
echo "Installing dependencies..."
pnpm install --force

# Navigate to grading app
cd apps/grading

# Debug: List files in key directories
echo "Checking file structure..."
echo "=== src/hooks ==="
ls -la src/hooks/ || echo "hooks directory not found"
echo "=== src/utils ==="
ls -la src/utils/ || echo "utils directory not found"
echo "=== src/components ==="
ls -la src/components/ || echo "components directory not found"
echo "=== src/contexts ==="
ls -la src/contexts/ || echo "contexts directory not found"

# Clean and regenerate Prisma
echo "Regenerating Prisma client..."
rm -rf ../../node_modules/.prisma
pnpm prisma generate

# Navigate back to monorepo root
cd ../..

# Build the grading app
echo "Building grading app..."
pnpm build --filter=@bluenote/grading