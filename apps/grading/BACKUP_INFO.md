# Backup Information

## Date: 2025-07-18

### Git Backup
- Branch: `backup/pre-dashboard-integration-20250718`
- Pushed to origin

### Local Backup
- File: `grading-backup-20250718-193238.tar.gz`
- Location: `/apps/`
- Size: 81MB

### Environment Files
- `.env.local` backed up to `.env.local.backup.20250718`

### Database Backup Instructions
1. For Supabase (Production):
   - Go to Supabase Dashboard
   - Navigate to Settings > Backups
   - Create a manual backup

2. For SQLite (Development):
   - Database file: `prisma/dev.db`
   - Already included in tar.gz backup

### Rollback Instructions
1. To rollback code:
   ```bash
   git checkout backup/pre-dashboard-integration-20250718
   ```

2. To restore local files:
   ```bash
   cd apps
   tar -xzf grading-backup-20250718-193238.tar.gz
   ```

3. To restore environment:
   ```bash
   cd grading
   cp .env.local.backup.20250718 .env.local
   ```