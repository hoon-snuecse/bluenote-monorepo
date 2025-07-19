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

# Debug: Check TypeScript config
echo "=== TypeScript Configuration ==="
cat tsconfig.json

# Debug: Test imports directly with TypeScript
echo "=== Testing module resolution with TypeScript ==="
echo 'import { useStudentGroups } from "@/hooks/useStudentGroups"; console.log("Import successful");' > test-import.ts
npx tsc test-import.ts --noEmit --moduleResolution node --baseUrl . --paths '{"@/*":["./src/*"]}' || echo "TypeScript resolution failed"
rm -f test-import.ts

# Clean and regenerate Prisma
echo "Regenerating Prisma client..."
rm -rf ../../node_modules/.prisma
rm -rf node_modules/.prisma
pnpm prisma generate

# Debug: Check if Prisma client was generated
echo "=== Checking Prisma client generation ==="
ls -la ../../node_modules/@prisma/client/ || echo "Prisma client directory not found"
ls -la ../../node_modules/.prisma/ || echo ".prisma directory not found"

# Try building directly in the grading app directory
echo "Building grading app directly..."
pnpm build