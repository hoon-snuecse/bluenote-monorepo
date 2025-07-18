import { env, features, apiConfig, securityConfig, isDevelopment, isProduction } from '@/lib/env'

// 앱 설정
export const appConfig = {
  name: env.NEXT_PUBLIC_APP_NAME || 'Bluenote Grading',
  url: env.NEXT_PUBLIC_APP_URL || (isDevelopment ? 'http://localhost:3002' : 'https://grading.bluenote.site'),
  isDevelopment,
  isProduction,
}

// 데이터베이스 설정
export const dbConfig = {
  url: env.DATABASE_URL,
  directUrl: env.DIRECT_URL,
}

// Supabase 설정
export const supabaseConfig = {
  url: env.NEXT_PUBLIC_SUPABASE_URL,
  anonKey: env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  serviceRoleKey: env.SUPABASE_SERVICE_ROLE_KEY,
}

// 인증 설정
export const authConfig = {
  nextAuthUrl: env.NEXTAUTH_URL || appConfig.url,
  nextAuthSecret: env.NEXTAUTH_SECRET,
  jwtSecret: env.JWT_SECRET,
  encryptionKey: env.ENCRYPTION_KEY,
  google: {
    clientId: env.GOOGLE_CLIENT_ID,
    clientSecret: env.GOOGLE_CLIENT_SECRET,
  },
}

// AI 서비스 설정
export const aiConfig = {
  anthropic: {
    apiKey: env.ANTHROPIC_API_KEY,
    enabled: !!env.ANTHROPIC_API_KEY && features.aiEvaluation,
  },
  openai: {
    apiKey: env.OPENAI_API_KEY,
    enabled: !!env.OPENAI_API_KEY && features.aiEvaluation,
  },
}

// 모니터링 설정
export const monitoringConfig = {
  sentry: {
    dsn: env.SENTRY_DSN,
    enabled: !!env.SENTRY_DSN && isProduction,
  },
}

// Export all configs
export {
  features,
  apiConfig,
  securityConfig,
}

// 환경 변수 체크 함수
export function checkRequiredEnvVars() {
  const required = [
    'DATABASE_URL',
    'JWT_SECRET',
    'ENCRYPTION_KEY',
  ]

  const missing = required.filter(key => !process.env[key])
  
  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:', missing.join(', '))
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`)
  }

  // 프로덕션 환경에서 추가 체크
  if (isProduction) {
    const productionRequired = [
      'NEXTAUTH_SECRET',
      'NEXTAUTH_URL',
    ]

    const productionMissing = productionRequired.filter(key => !process.env[key])
    
    if (productionMissing.length > 0) {
      console.error('❌ Missing required production environment variables:', productionMissing.join(', '))
      throw new Error(`Missing required production environment variables: ${productionMissing.join(', ')}`)
    }
  }

  console.log('✅ All required environment variables are set')
}

// 환경 변수 정보 출력 (민감한 정보 제외)
export function printEnvInfo() {
  console.log('🔧 Environment Configuration:')
  console.log(`  - App Name: ${appConfig.name}`)
  console.log(`  - App URL: ${appConfig.url}`)
  console.log(`  - Environment: ${env.NODE_ENV}`)
  console.log(`  - Database: ${dbConfig.url ? 'Connected' : 'Not configured'}`)
  console.log(`  - Supabase: ${supabaseConfig.url ? 'Configured' : 'Not configured'}`)
  console.log(`  - NextAuth: ${authConfig.nextAuthUrl ? 'Configured' : 'Not configured'}`)
  console.log(`  - AI Services:`)
  console.log(`    - Anthropic: ${aiConfig.anthropic.enabled ? 'Enabled' : 'Disabled'}`)
  console.log(`    - OpenAI: ${aiConfig.openai.enabled ? 'Enabled' : 'Disabled'}`)
  console.log(`  - Features:`)
  console.log(`    - AI Evaluation: ${features.aiEvaluation ? 'Enabled' : 'Disabled'}`)
  console.log(`    - Batch Evaluation: ${features.batchEvaluation ? 'Enabled' : 'Disabled'}`)
  console.log(`    - PDF Export: ${features.pdfExport ? 'Enabled' : 'Disabled'}`)
  console.log(`    - Excel Export: ${features.excelExport ? 'Enabled' : 'Disabled'}`)
  console.log(`    - SSE Updates: ${features.sseUpdates ? 'Enabled' : 'Disabled'}`)
  console.log(`    - Cache: ${features.cache ? 'Enabled' : 'Disabled'}`)
  console.log(`    - Maintenance Mode: ${features.maintenanceMode ? 'ON' : 'OFF'}`)
}