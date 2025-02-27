#!/bin/bash

# Load environment variables
source ../.env

# Configuration
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
LOG_DIR="../logs/migrations"
LOG_FILE="$LOG_DIR/migration_$TIMESTAMP.log"

# Create log directory if it doesn't exist
mkdir -p $LOG_DIR

# Log function
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a $LOG_FILE
}

# Function to run migrations
run_migrations() {
    log "Starting database migrations"
    
    # Run TypeORM migrations
    npm run typeorm migration:run 2>> $LOG_FILE
    
    if [ $? -eq 0 ]; then
        log "Migrations completed successfully"
        return 0
    else
        log "Migrations failed"
        return 1
    fi
}

# Function to verify migrations
verify_migrations() {
    log "Verifying migrations"
    
    # Check if any pending migrations exist
    PENDING_MIGRATIONS=$(npm run typeorm migration:show | grep "not executed" | wc -l)
    
    if [ $PENDING_MIGRATIONS -eq 0 ]; then
        log "All migrations are up to date"
        return 0
    else
        log "Found $PENDING_MIGRATIONS pending migrations"
        return 1
    fi
}

# Function to create backup before migration
create_backup() {
    log "Creating backup before migration"
    ./backup.sh premigration_$TIMESTAMP
    
    if [ $? -eq 0 ]; then
        log "Backup created successfully"
        return 0
    else
        log "Backup failed"
        return 1
    fi
}

# Main execution
log "Starting migration process"

# Create backup first
if ! create_backup; then
    log "Failed to create backup. Aborting migration."
    exit 1
fi

# Run migrations
if ! run_migrations; then
    log "Migration failed. Rolling back might be necessary."
    exit 1
fi

# Verify migrations
if ! verify_migrations; then
    log "Migration verification failed. Please check pending migrations."
    exit 1
fi

log "Migration process completed successfully"
exit 0