# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.1] - 2025-08-17

### 🔧 Admin Dashboard & AI Chat Improvements

This release fixes critical issues with the admin dashboard functionality and enhances the Claude AI chat feature.

### Fixed
- **Admin Dashboard Data Display**: 
  - Fixed analytics page showing no data after unified authentication implementation
  - Connected real usage data from `usage_logs` table (770+ login records)
  - Connected grading statistics from `Evaluation` table (93 records: 63 Sonnet, 30 Opus)
  - Fixed user list page not displaying any users
  - Fixed content management page showing empty lists

- **API Response Issues**:
  - Fixed 404 errors by using `Response.json()` instead of `NextResponse.json()`
  - Fixed field mapping issues (`user_email` vs `email`)
  - Resolved React hydration errors

- **ESLint Errors**: 
  - Fixed `react-hooks/exhaustive-deps` warnings in AdminAnalyticsClient and AdminContentClient
  - Wrapped fetch functions in `useCallback` with proper dependencies

- **AI Chat Login Loop**:
  - Fixed infinite login loop at `/ai/chat` page
  - Corrected `session-check` API's `createServerClient` call
  - Updated ClaudeChat to use `useSupabaseAuth` hook directly
  - Changed redirect from `/login` to home page

- **Database Permission Issues**:
  - Added error handling for `Evaluation` table RLS permission errors (code 42501)
  - Service Role Key not bypassing RLS as expected (requires Supabase dashboard fix)

### Added
- **Claude Model Selection Enhancement**:
  - Added Claude Opus 4.1 (claude-opus-4-1-20250805) - highest performance model
  - Added Claude Sonnet 4 (claude-sonnet-4-20250514) - latest fast model
  - Total 5 models available with badges and descriptions
  - Model-specific max_tokens optimization (Opus 4.1: 8192, Sonnet 4: 4096)
  
- **API Error Checking & Logging**:
  - Comprehensive error logging in chat-stream API
  - Response time measurement for API calls
  - Detailed request/response logging for debugging

### Changed
- **Admin Analytics Improvements**:
  - Separated login statistics from grading statistics
  - Added real-time data from database instead of mock data
  - Enhanced user activity tracking with login counts
  - Added top users by model usage (Sonnet/Opus)

## [0.2.0] - 2025-08-08

### 🎉 Major Authentication Overhaul

This release standardizes authentication across all three applications (web, grading, quiz) using a unified Supabase authentication system.

### Added
- **@bluenote/supabase-auth Package**: New unified authentication package for all apps
  - Client-side hooks with `useSupabaseAuth()`
  - Server-side route handler client support
  - Automatic session refresh and management
  - Cross-subdomain cookie sharing support

- **Quiz App Authentication**: Full authentication integration for quiz.bluenote.site
  - Session check API endpoint (`/api/auth/session-check`)
  - Auth callback handler for Google OAuth
  - Environment variables configuration

### Changed
- **Authentication Migration**: All apps now use @bluenote/supabase-auth instead of mixed auth systems
  - Web app: Migrated from NextAuth to Supabase Auth
  - Grading app: Simplified auth system using unified package
  - Quiz app: Implemented complete authentication flow

- **Navigation Components**: Updated across all apps to properly display logged-in state
  - Consistent user display with email
  - Unified sign-out functionality
  - Proper loading states

- **Cookie Configuration**: Standardized cookie settings for cross-domain authentication
  - Domain: `.bluenote.site` for shared sessions
  - httpOnly: false for client-side access
  - Proper SameSite and Secure settings

- **Provider Updates**: Enhanced SupabaseAuthProvider with direct user property access
  ```javascript
  const { user, session, loading, signInWithGoogle, signOut } = useSupabaseAuth()
  ```

### Fixed
- Quiz app navigation not showing logged-in state after authentication
- Cross-subdomain cookie sharing not working properly
- Session persistence issues across app restarts
- Missing route-handler-client export in @bluenote/supabase-auth package

### UI Improvements
- **Grading App Login Page**: Removed irrelevant "AI로 만드는 스마트한 퀴즈" text
- **Navigation Consistency**: All apps now show consistent navigation with user info
- **Login Flow**: Standardized Google OAuth login across all apps

### Technical Details
- **Port Configuration**:
  - Web app: 3000
  - Grading app: 3002
  - Quiz app: 3003

- **Environment Variables**: Unified Supabase configuration across all apps
  ```bash
  NEXT_PUBLIC_SUPABASE_URL
  NEXT_PUBLIC_SUPABASE_ANON_KEY
  SUPABASE_SERVICE_ROLE_KEY
  ```

### Documentation
- Updated CLAUDE.md files for all apps with v0.2 changes
- Updated README.md with new authentication architecture
- Added version badges and update dates

### Breaking Changes
- Apps using old NextAuth configuration need to migrate to @bluenote/supabase-auth
- Environment variables changed from NEXTAUTH_* to SUPABASE_* format

## [0.1.0] - 2024-12-01

### Initial Release
- Basic monorepo structure with web and grading apps
- Initial authentication setup with mixed systems
- Basic UI components in @bluenote/ui package

---

For detailed migration instructions, see [MIGRATION.md](./docs/MIGRATION.md)