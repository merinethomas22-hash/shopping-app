#!/bin/bash
# Backup script for PostgreSQL database

DB_USER="postgres"
DB_NAME="babyshop"
DB_HOST="localhost"
BACKUP_DIR="/backups"
DATE=$(date +"%Y%m%d_%H%M%S")
FILE_NAME="babyshop_backup_$DATE.sql"

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

# Run pg_dump
pg_dump -U $DB_USER -h $DB_HOST -F p $DB_NAME > "$BACKUP_DIR/$FILE_NAME"

# Compress backup
gzip "$BACKUP_DIR/$FILE_NAME"

# Keep only last 7 backups
find $BACKUP_DIR -type f -name "*.sql.gz" -mtime +7 -exec rm {} \;

# Upload to S3 if configured
if [ -n "$S3_BUCKET" ]; then
    echo "Uploading backup to S3 bucket $S3_BUCKET..."
    aws s3 cp "$BACKUP_DIR/$FILE_NAME.gz" "s3://$S3_BUCKET/database_backups/$FILE_NAME.gz"
fi

echo "Backup completed: $BACKUP_DIR/$FILE_NAME.gz"
