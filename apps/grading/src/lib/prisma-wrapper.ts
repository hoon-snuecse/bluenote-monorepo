// This file wraps Prisma Client to handle module resolution issues in production
export * from '@prisma/client';

let PrismaClientModule: any;

try {
  // Try standard import
  PrismaClientModule = require('@prisma/client');
} catch (e) {
  console.error('Failed to import @prisma/client, trying alternative paths...');
  
  // Try alternative paths
  const paths = [
    '../../../../node_modules/.pnpm/@prisma+client@6.11.1_patch_hash=2q7iap2sdrpftz2vc4d5uxhyba_prisma@6.11.1_typescript@5.8.3__typescript@5.8.3/node_modules/@prisma/client',
    '../../../../node_modules/@prisma/client',
    '../../../node_modules/@prisma/client',
    '../../node_modules/@prisma/client',
  ];
  
  for (const path of paths) {
    try {
      PrismaClientModule = require(path);
      console.log(`Successfully loaded Prisma Client from: ${path}`);
      break;
    } catch (err) {
      // Continue to next path
    }
  }
  
  if (!PrismaClientModule) {
    throw new Error('Could not find @prisma/client in any of the expected locations');
  }
}

export const PrismaClient = PrismaClientModule.PrismaClient || PrismaClientModule.default?.PrismaClient;

if (!PrismaClient) {
  throw new Error('PrismaClient not found in the imported module');
}