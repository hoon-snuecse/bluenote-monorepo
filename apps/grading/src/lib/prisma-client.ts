// This file provides a stable import path for Prisma Client
import { PrismaClient as PrismaClientType } from '@prisma/client';

let PrismaClientConstructor: typeof PrismaClientType;

// Try different import strategies
try {
  // Try standard import first
  const prismaModule = require('@prisma/client');
  PrismaClientConstructor = prismaModule.PrismaClient;
} catch (e) {
  // If that fails, try the generated client directly
  try {
    const generatedClient = require('../../node_modules/.prisma/client');
    PrismaClientConstructor = generatedClient.PrismaClient;
  } catch (e2) {
    // Last resort - try the pnpm path
    try {
      const pnpmClient = require('../../../../node_modules/.pnpm/@prisma+client@6.11.1_patch_hash=2q7iap2sdrpftz2vc4d5uxhyba_prisma@6.11.1_typescript@5.8.3__typescript@5.8.3/node_modules/@prisma/client');
      PrismaClientConstructor = pnpmClient.PrismaClient;
    } catch (e3) {
      throw new Error('Could not find Prisma Client. Please run "prisma generate"');
    }
  }
}

export const PrismaClient = PrismaClientConstructor;
export type { PrismaClient as PrismaClientType } from '@prisma/client';