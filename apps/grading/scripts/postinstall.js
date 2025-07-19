#!/usr/bin/env node
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('Running postinstall script...');

try {
  // Generate Prisma Client
  console.log('Generating Prisma Client...');
  execSync('npx prisma generate', { stdio: 'inherit' });
  
  // Find the generated .prisma directory
  const pnpmPrismaPath = path.join(__dirname, '../../../node_modules/.pnpm');
  const prismaClientPath = path.join(__dirname, '../../../node_modules/@prisma/client');
  
  // Check if we're in a pnpm environment (Vercel)
  if (fs.existsSync(pnpmPrismaPath)) {
    console.log('Detected pnpm environment, looking for generated Prisma client...');
    
    // Find the .prisma directory in pnpm structure
    const findPrismaDir = (dir) => {
      const files = fs.readdirSync(dir);
      for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
          if (file === '.prisma') {
            return fullPath;
          }
          if (file.includes('@prisma+client')) {
            const result = findPrismaDir(fullPath);
            if (result) return result;
          }
        }
      }
      return null;
    };
    
    const sourcePrismaDir = findPrismaDir(pnpmPrismaPath);
    
    if (sourcePrismaDir) {
      console.log(`Found Prisma client at: ${sourcePrismaDir}`);
      
      // Create symlink or copy to expected location
      const targetDir = path.join(prismaClientPath, '.prisma');
      
      try {
        // Ensure parent directory exists
        fs.mkdirSync(prismaClientPath, { recursive: true });
        
        // Remove existing .prisma directory if it exists
        if (fs.existsSync(targetDir)) {
          fs.rmSync(targetDir, { recursive: true, force: true });
        }
        
        // Try to create symlink first
        try {
          fs.symlinkSync(sourcePrismaDir, targetDir, 'dir');
          console.log('Created symlink to Prisma client');
        } catch (symlinkError) {
          // If symlink fails, copy the directory
          console.log('Symlink failed, copying Prisma client...');
          execSync(`cp -r "${sourcePrismaDir}" "${targetDir}"`);
          console.log('Copied Prisma client to expected location');
        }
      } catch (error) {
        console.error('Failed to setup Prisma client:', error);
      }
    }
  }
  
  console.log('Postinstall completed');
} catch (error) {
  console.error('Postinstall script failed:', error);
  // Don't fail the install
  process.exit(0);
}