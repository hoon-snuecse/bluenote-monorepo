import { PrismaClient } from '@/generated/prisma';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Connection URL with pgbouncer parameters
let databaseUrl = process.env.DATABASE_URL || '';
const isPgBouncer = databaseUrl.includes('pooler.supabase.com');

// Ensure pgbouncer parameters for Supabase pooler
if (isPgBouncer) {
  const url = new URL(databaseUrl);
  url.searchParams.set('pgbouncer', 'true');
  url.searchParams.set('statement_cache_size', '0');
  url.searchParams.set('connection_limit', '1');
  databaseUrl = url.toString();
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  datasources: {
    db: {
      url: databaseUrl
    }
  }
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Gracefully shutdown Prisma Client
if (process.env.NODE_ENV === 'production') {
  process.on('beforeExit', async () => {
    await prisma.$disconnect();
  });
}

// For serverless environments, ensure proper cleanup
process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

export default prisma;