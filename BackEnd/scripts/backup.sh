#!/bin/bash

# Load environment variables
source ../.env

# Configuration
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="../backups/database"
BACKUP_FILE="$BACKUP_DIR/backup_$TIMESTAMP.sql"
LOG_DIR="../logs/backups"
LOG_FILE="$LOG_DIR/backup_$TIMESTAMP.log"

# Create directories if they don't exist
mkdir -p $BACKUP_DIR
mkdir -p $LOG_DIR

# Log function
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a $LOG_FILE
}

# Function to cleanup old backups
cleanup_old_backups() {
    local retention_days=30
    log "Cleaning up backups older than $retention_days days"
    find $BACKUP_DIR -name "backup_*.sql" -mtime +$retention_days -delete
    find $LOG_DIR -name "backup_*.log" -mtime +$retention_days -delete
}

# Function to send notification
send_notification() {
    local status=$1
    local message=$2
    
    # Add your notification logic here (email, Slack, etc.)
    if [ "$status" = "success" ]; then
        echo "Backup completed successfully: $message"
    else
        echo "Backup failed: $message"
    fi
}

# Start backup
log "Starting database backup"
log "Target file: $BACKUP_FILE"

# Perform backup
PGPASSWORD=$DB_PASSWORD pg_dump \
    -h $DB_HOST \
    -p $DB_PORT \
    -U $DB_USERNAME \
    -d $DB_NAME \
    -F p \
    -f $BACKUP_FILE \
    --verbose \
    2>> $LOG_FILE

# Check if backup was successful
if [ $? -eq 0 ]; then
    # Compress backup
    gzip $BACKUP_FILE
    BACKUP_SIZE=$(du -h "$BACKUP_FILE.gz" | cut -f1)
    
    log "Backup completed successfully"
    log "Backup size: $BACKUP_SIZE"
    send_notification "success" "Backup completed. Size: $BACKUP_SIZE"
    
    # Cleanup old backups
    cleanup_old_backups
else
    log "Backup failed"
    send_notification "failure" "Database backup failed. Check logs for details."
    exit 1
fi

# Optional: Upload to cloud storage
if [ ! -z "$AWS_ACCESS_KEY_ID" ]; then
    log "Uploading backup to S3"
    aws s3 cp "$BACKUP_FILE.gz" "s3://$AWS_BUCKET_NAME/backups/database/"
    
    if [ $? -eq 0 ]; then
        log "Upload to S3 completed successfully"
    else
        log "Upload to S3 failed"
        send_notification "failure" "S3 upload failed. Check logs for details."
    fi
fi

exit 0