import { z } from 'zod'

// 환경 변수 스키마 정의
const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().min(1),
  DIRECT_URL: z.string().optional(),
  
  // Supabase
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
  
  // Authentication
  NEXTAUTH_URL: z.string().url().optional(),
  NEXTAUTH_SECRET: z.string().optional(),
  JWT_SECRET: z.string().min(32),
  ENCRYPTION_KEY: z.string().min(32),
  
  // AI Services
  ANTHROPIC_API_KEY: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),
  
  // Google OAuth
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  
  // Application
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
  NEXT_PUBLIC_APP_NAME: z.string().optional(),
  
  // Feature Flags
  ENABLE_AI_EVALUATION: z.string().transform(val => val === 'true').optional(),
  ENABLE_BATCH_EVALUATION: z.string().transform(val => val === 'true').optional(),
  ENABLE_PDF_EXPORT: z.string().transform(val => val === 'true').optional(),
  ENABLE_EXCEL_EXPORT: z.string().transform(val => val === 'true').optional(),
  ENABLE_SSE_UPDATES: z.string().transform(val => val === 'true').optional(),
  
  // Performance
  ENABLE_CACHE: z.string().transform(val => val === 'true').optional(),
  CACHE_TTL_SECONDS: z.string().transform(Number).optional(),
  
  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: z.string().transform(Number).optional(),
  RATE_LIMIT_MAX_REQUESTS: z.string().transform(Number).optional(),
  
  // File Upload
  MAX_FILE_SIZE: z.string().transform(Number).optional(),
  ALLOWED_FILE_TYPES: z.string().optional(),
  
  // Monitoring
  SENTRY_DSN: z.string().optional(),
  
  // Security
  CORS_ORIGIN: z.string().optional(),
  CSP_DIRECTIVES: z.string().optional(),
  
  // Maintenance
  MAINTENANCE_MODE: z.string().transform(val => val === 'true').optional(),
  
  // Node
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
})

// 환경 변수 타입
export type Env = z.infer<typeof envSchema>

// 환경 변수 검증 및 파싱
const parseEnv = () => {
  try {
    return envSchema.parse(process.env)
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Invalid environment variables:')
      console.error(error.flatten().fieldErrors)
      throw new Error('Invalid environment variables')
    }
    throw error
  }
}

// 환경 변수 export
export const env = parseEnv()

// 환경별 설정
export const isDevelopment = env.NODE_ENV === 'development'
export const isProduction = env.NODE_ENV === 'production'
export const isTest = env.NODE_ENV === 'test'

// Feature flags
export const features = {
  aiEvaluation: env.ENABLE_AI_EVALUATION ?? true,
  batchEvaluation: env.ENABLE_BATCH_EVALUATION ?? true,
  pdfExport: env.ENABLE_PDF_EXPORT ?? true,
  excelExport: env.ENABLE_EXCEL_EXPORT ?? true,
  sseUpdates: env.ENABLE_SSE_UPDATES ?? true,
  cache: env.ENABLE_CACHE ?? true,
  maintenanceMode: env.MAINTENANCE_MODE ?? false,
}

// API 설정
export const apiConfig = {
  rateLimitWindowMs: env.RATE_LIMIT_WINDOW_MS ?? 15 * 60 * 1000, // 15분
  rateLimitMaxRequests: env.RATE_LIMIT_MAX_REQUESTS ?? 100,
  maxFileSize: env.MAX_FILE_SIZE ?? 10 * 1024 * 1024, // 10MB
  allowedFileTypes: env.ALLOWED_FILE_TYPES?.split(',') ?? [
    'text/plain',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ],
  cacheTtlSeconds: env.CACHE_TTL_SECONDS ?? 3600, // 1시간
}

// 보안 설정
export const securityConfig = {
  corsOrigin: env.CORS_ORIGIN?.split(',') ?? ['https://grading.bluenote.site', 'https://bluenote.site'],
  cspDirectives: env.CSP_DIRECTIVES ?? "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';",
}