#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('Running postinstall script for Prisma client generation...');

try {
  // Generate Prisma client
  console.log('Generating Prisma client...');
  execSync('npx prisma generate', { 
    stdio: 'inherit',
    cwd: __dirname + '/..'
  });

  // Find the @prisma/client module
  const findPrismaClient = () => {
    const possiblePaths = [
      path.join(__dirname, '../../../node_modules/@prisma/client'),
      path.join(__dirname, '../node_modules/@prisma/client'),
      path.join(__dirname, '../../../node_modules/.pnpm/@prisma+client@6.11.1_patch_hash=2q7iap2sdrpftz2vc4d5uxhyba_prisma@6.11.1_typescript@5.8.3__typescript@5.8.3/node_modules/@prisma/client'),
    ];

    for (const clientPath of possiblePaths) {
      if (fs.existsSync(clientPath)) {
        return clientPath;
      }
    }
    
    throw new Error('Could not find @prisma/client module');
  };

  const prismaClientPath = findPrismaClient();
  console.log('Found Prisma client at:', prismaClientPath);

  // Create symlink to .prisma folder
  const prismaFolder = path.join(path.dirname(prismaClientPath), '.prisma');
  const targetPrismaFolder = path.join(__dirname, '../node_modules/.prisma');

  if (!fs.existsSync(path.dirname(targetPrismaFolder))) {
    fs.mkdirSync(path.dirname(targetPrismaFolder), { recursive: true });
  }

  if (fs.existsSync(targetPrismaFolder)) {
    fs.rmSync(targetPrismaFolder, { recursive: true, force: true });
  }

  if (fs.existsSync(prismaFolder)) {
    // Copy instead of symlink for better compatibility
    execSync(`cp -r "${prismaFolder}" "${targetPrismaFolder}"`, { stdio: 'inherit' });
    console.log('Copied .prisma folder to local node_modules');
  }

  console.log('Postinstall script completed successfully');
} catch (error) {
  console.error('Postinstall script failed:', error.message);
  process.exit(1);
}