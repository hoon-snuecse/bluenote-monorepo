#!/bin/bash

# Backup script for production database

set -e

# Configuration
BACKUP_DIR="/var/backups/grading-app"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="backup_${TIMESTAMP}.sql"
RETENTION_DAYS=7

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

echo "🔄 Starting database backup..."

# Backup database using Docker
if command -v docker &> /dev/null; then
    # Using Docker
    docker-compose exec -T db pg_dump -U grading_user grading_app > "$BACKUP_DIR/$BACKUP_FILE"
else
    # Direct PostgreSQL backup
    pg_dump $DATABASE_URL > "$BACKUP_DIR/$BACKUP_FILE"
fi

# Compress backup
gzip "$BACKUP_DIR/$BACKUP_FILE"

echo "✅ Backup completed: ${BACKUP_FILE}.gz"

# Clean old backups
echo "🧹 Cleaning old backups..."
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +$RETENTION_DAYS -delete

echo "✅ Backup process completed successfully!"

# Optional: Upload to cloud storage
# aws s3 cp "$BACKUP_DIR/${BACKUP_FILE}.gz" s3://your-bucket/backups/
# gcloud storage cp "$BACKUP_DIR/${BACKUP_FILE}.gz" gs://your-bucket/backups/