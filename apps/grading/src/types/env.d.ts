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
    GOOGLE_REDIRECT_URI: string
    GOOGLE_REDIRECT_URI_DEV?: string
    
    // AI API Keys
    CLAUDE_API_KEY?: string
    ANTHROPIC_API_KEY: string
    
    // JWT
    JWT_SECRET: string
    
    // Google Drive
    GOOGLE_DRIVE_CLIENT_ID?: string
    GOOGLE_DRIVE_CLIENT_SECRET?: string
    GOOGLE_DRIVE_REFRESH_TOKEN?: string
    
    // Environment
    NODE_ENV: 'development' | 'production' | 'test'
  }
}