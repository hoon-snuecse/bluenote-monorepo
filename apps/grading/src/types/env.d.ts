declare namespace NodeJS {
  interface ProcessEnv {
    // Database
    DATABASE_URL: string
    
    // Authentication
    NEXTAUTH_URL: string
    NEXTAUTH_SECRET: string
    
    // Google OAuth
    GOOGLE_CLIENT_ID: string
    GOOGLE_CLIENT_SECRET: string
    
    // AI API Keys
    CLAUDE_API_KEY?: string
    ANTHROPIC_API_KEY: string
    
    // JWT
    JWT_SECRET: string
    
    // Environment
    NODE_ENV: 'development' | 'production' | 'test'
  }
}