#!/usr/bin/env node
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('Running postinstall script...');

try {
  // Generate Prisma Client
  console.log('Generating Prisma Client...');
  execSync('npx prisma generate', { stdio: 'inherit' });
  
  // In Vercel's pnpm environment, we need to find where Prisma generated the client
  // and copy it to where @prisma/client expects it
  const pnpmDir = path.join(__dirname, '../../../node_modules/.pnpm');
  
  if (fs.existsSync(pnpmDir)) {
    console.log('Detected pnpm environment (Vercel)...');
    
    // Find the @prisma+client directory in pnpm
    const dirs = fs.readdirSync(pnpmDir);
    const prismaClientDir = dirs.find(dir => dir.includes('@prisma+client@'));
    
    if (prismaClientDir) {
      const sourcePrismaPath = path.join(pnpmDir, prismaClientDir, 'node_modules/.prisma');
      const targetPrismaPath = path.join(pnpmDir, prismaClientDir, 'node_modules/@prisma/client/.prisma');
      
      if (fs.existsSync(sourcePrismaPath)) {
        console.log(`Found .prisma at: ${sourcePrismaPath}`);
        
        // Ensure @prisma/client directory exists
        const prismaClientPath = path.join(pnpmDir, prismaClientDir, 'node_modules/@prisma/client');
        fs.mkdirSync(prismaClientPath, { recursive: true });
        
        // Copy .prisma directory
        console.log(`Copying to: ${targetPrismaPath}`);
        execSync(`cp -r "${sourcePrismaPath}" "${targetPrismaPath}"`);
        console.log('Successfully copied Prisma client to expected location');
      } else {
        console.log('Warning: Could not find generated .prisma directory');
      }
    } else {
      console.log('Warning: Could not find @prisma+client in pnpm directory');
    }
  }
  
  console.log('Postinstall completed');
} catch (error) {
  console.error('Postinstall script failed:', error);
  // Don't fail the install
  process.exit(0);
}