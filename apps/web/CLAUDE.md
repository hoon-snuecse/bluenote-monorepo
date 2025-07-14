# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 15.3.4 educational research website ("박교수의 연구실") with Claude AI integration, authentication, and full CMS capabilities. The main application is located in the `my-claude-app/` directory. The site includes portfolio sections for research, teaching, analytics, and a general content area ("shed"), all with full CRUD functionality.

## Development Commands

Run all commands from the `my-claude-app/` directory:

```bash
# Development server with Turbopack
npm run dev

# Production build
npm run build

# Start production server
npm run start

# Run ESLint
npm run lint
```

## Environment Setup

Create a `.env.local` file in `my-claude-app/` with:
```
# Claude AI
ANTHROPIC_API_KEY=your-anthropic-api-key-here

# NextAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# Admin Access
ADMIN_EMAILS=comma-separated-admin-emails
```

The Anthropic API key must start with `sk-ant-`. Default admin email is `hoon@snuecse.org`.

## Architecture Overview

### Directory Structure
- `app/` - Next.js App Router pages and layouts
  - `api/` - API endpoints
    - `claude/` - Claude AI chat API endpoint
    - `generate-content/` - Content generation API
    - `preview/html/` - HTML file preview proxy
    - `research/`, `teaching/`, `analytics/`, `shed/` - CRUD endpoints for each section
    - `auth/` - NextAuth authentication endpoints
  - `research/` - Research achievements and publications
  - `teaching/` - Teaching-related content with CRUD
  - `analytics/` - Analytics content with CRUD
  - `shed/` - General content area with CRUD
  - `ai/chat/` - Claude AI chat interface (protected)
  - `admin/` - Admin dashboard (protected)
- `posts/` - Markdown content files
- `components/` - Shared React components
- `data/` - Static data files
- `lib/` - Utility functions and configurations
  - `supabase/` - Database client configurations
  - `auth/` - Authentication utilities

### Key Technologies
- **Framework**: Next.js 15.3.4 with App Router
- **Language**: JavaScript (not TypeScript)
- **Styling**: Tailwind CSS with custom animations
- **AI**: Claude API SDK (@anthropic-ai/sdk) using claude-sonnet-4-20250514 model
- **Icons**: Lucide React
- **Authentication**: NextAuth with Google OAuth
- **Database**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage for images and documents
- **Date Handling**: date-fns
- **Markdown**: gray-matter for frontmatter parsing

### Features

#### Authentication & Authorization
- Google OAuth integration via NextAuth
- Role-based access control (admin/user) via Supabase
- Protected routes via middleware
- Session management across the application
- User permissions stored in `user_permissions` table

#### User Management System
- **Allowlist-based access**: Only users in `user_permissions` table can log in
- **Admin dashboard**: `/admin/dashboard` for system management
- **User management**: Add, edit, delete users with granular permissions
- **Usage tracking**: Monitor Claude AI usage and content actions

#### Content Management System
Each section (Research, Teaching, Analytics, Shed) includes:
- List view with card-based layout
- Create/Edit forms with rich text editing
- File upload for images and documents
- Delete functionality with confirmation
- Tag management and categorization
- AI-assisted content generation
- **Permission-based access**: Only users with `can_write` permission can create/edit

#### File Management
- Multiple file upload support
- Automatic organization by post ID
- Support for images and documents
- HTML file preview with sandboxed iframe
- Direct file access via Supabase Storage

#### Claude AI Integration
1. `/api/claude` - Chat interface with context-aware system prompts
   - **Daily usage limits**: Configurable per user
   - **Usage tracking**: All interactions logged
   - **Real-time usage display**: Shows remaining quota
2. `/api/generate-content` - Generates structured content for different post types

Both endpoints require authentication and check usage limits.

### Database Schema

#### Content Tables
Each content section has three tables:
- `{section}_posts` - Main content (title, category, content, summary, tags, etc.)
- `{section}_post_images` - Image attachments
- `{section}_post_files` - Document attachments

#### User Management Tables
- `user_permissions` - User access control and settings
  - `email` (primary key)
  - `role` (admin/user)
  - `claude_daily_limit`
  - `can_write`
  - `created_at`, `updated_at`
- `usage_logs` - Action tracking for analytics
  - `user_email`
  - `action_type` (claude_chat, post_write, etc.)
  - `created_at`

### Important Notes

- No testing framework is currently configured
- The project uses JavaScript, not TypeScript
- All Claude API calls use the claude-sonnet-4-20250514 model
- The floating Claude chat button is integrated into the root layout
- Content is primarily in Korean with English technical elements
- Authentication is required for admin functions and AI chat
- File uploads are limited to images and documents
- The preview proxy only allows Supabase storage URLs for security

### Security Considerations

- **Access Control**: Only users in `user_permissions` table can log in
- **Role-based Permissions**: Admin role required for user management
- **Write Permissions**: Controlled via `can_write` field per user
- **Usage Limits**: Claude AI usage limited per user per day
- **HTML Previews**: Sandboxed with strict CSP headers
- **File Uploads**: Validation and size limits enforced
- **Protected Routes**: Middleware checks authentication and roles
- **API Security**: All endpoints validate session and permissions
- **SQL Injection Prevention**: Parameterized queries and RLS policies
- **XSS Protection**: Security headers and input sanitization

### Deployment

See `README_DEPLOYMENT.md` for detailed deployment instructions including:
- Supabase setup and migrations
- Google OAuth configuration
- Environment variables
- Security checklist
- Monitoring and backup procedures