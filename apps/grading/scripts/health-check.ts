#!/usr/bin/env node

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkHealth() {
  console.log('🏥 Health Check Starting...\n')
  
  const checks = {
    database: false,
    environment: false,
    api: false,
  }
  
  // 1. Database Connection Check
  try {
    await prisma.$connect()
    console.log('✅ Database connection: OK')
    checks.database = true
  } catch (error) {
    console.error('❌ Database connection: FAILED')
    console.error(error)
  }
  
  // 2. Environment Variables Check
  const requiredEnvVars = [
    'DATABASE_URL',
    'NEXTAUTH_SECRET',
    'ANTHROPIC_API_KEY',
    'JWT_SECRET'
  ]
  
  const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar])
  
  if (missingEnvVars.length === 0) {
    console.log('✅ Environment variables: OK')
    checks.environment = true
  } else {
    console.error('❌ Environment variables: MISSING')
    console.error('Missing:', missingEnvVars.join(', '))
  }
  
  // 3. API Key Validation
  if (process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY) {
    console.log('✅ AI API key: OK')
    checks.api = true
  } else {
    console.error('❌ AI API key: MISSING')
  }
  
  // Summary
  console.log('\n📊 Health Check Summary:')
  console.log('------------------------')
  Object.entries(checks).forEach(([key, value]) => {
    console.log(`${key}: ${value ? '✅ PASS' : '❌ FAIL'}`)
  })
  
  const allPassed = Object.values(checks).every(check => check === true)
  
  if (allPassed) {
    console.log('\n🎉 All health checks passed!')
  } else {
    console.log('\n⚠️  Some health checks failed. Please fix the issues above.')
  }
  
  await prisma.$disconnect()
  process.exit(allPassed ? 0 : 1)
}

checkHealth().catch(console.error)