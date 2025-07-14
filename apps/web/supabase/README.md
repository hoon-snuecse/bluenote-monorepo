# Supabase Database Setup

## Overview
This directory contains the database schema for BlueNote Atelier.

## Setup Instructions

### 1. Create a new Supabase project
Visit [Supabase](https://supabase.com) and create a new project.

### 2. Run the migration
1. Go to SQL Editor in your Supabase Dashboard
2. Copy the contents of `migrations/00_complete_schema.sql`
3. Paste and run the entire script
4. This will create all necessary tables, indexes, triggers, and initial data

### 3. Create Storage Buckets
In Supabase Dashboard > Storage, create the following public buckets:
- `shed-images`
- `research-images`
- `teaching-images`
- `analytics-images`

### 4. Get your API keys
From Settings > API:
- `NEXT_PUBLIC_SUPABASE_URL` - Your project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your anon/public key
- `SUPABASE_SERVICE_ROLE_KEY` - Your service role key (keep secret!)

## Database Structure

### Core Tables
- `shed_posts` - Personal diary/journal posts
- `research_posts` - Research articles and publications
- `teaching_posts` - Teaching materials and resources
- `analytics_posts` - Data analysis posts
- `research_files` - File attachments for research posts

### User Management
- `user_permissions` - User access control and limits
- `usage_logs` - Tracks user actions for analytics

### Features
- Automatic `updated_at` timestamps via triggers
- Performance indexes on frequently queried columns
- Row Level Security (RLS) ready but disabled by default
- Daily usage summary view for admin dashboard

## Maintenance

### Adding a new user
```sql
INSERT INTO user_permissions (email, role, claude_daily_limit, can_write) 
VALUES ('user@email.com', 'user', 3, true);
```

### Making someone an admin
```sql
UPDATE user_permissions 
SET role = 'admin', claude_daily_limit = 999999, can_write = true 
WHERE email = 'user@email.com';
```

### Checking usage statistics
```sql
SELECT * FROM daily_usage_summary 
WHERE usage_date = CURRENT_DATE;
```

## Backup History
Previous individual migration files are stored in `migrations_backup/` for reference.