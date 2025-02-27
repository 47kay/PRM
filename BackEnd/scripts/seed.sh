#!/bin/bash

# Load environment variables
source ../.env

# Configuration
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
LOG_DIR="../logs/seeds"
LOG_FILE="$LOG_DIR/seed_$TIMESTAMP.log"

# Create log directory if it doesn't exist
mkdir -p $LOG_DIR

# Log function
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a $LOG_FILE
}

# Function to check database connection
check_db_connection() {
    log "Checking database connection"
    PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USERNAME -d $DB_NAME -c '\q' 2>/dev/null
    
    if [ $? -eq 0 ]; then
        log "Database connection successful"
        return 0
    else
        log "Failed to connect to database"
        return 1
    fi
}

# Function to run specific seed
run_seed() {
    local seed_name=$1
    log "Running seed: $seed_name"
    
    npm run typeorm:seed:run -n $seed_name 2>> $LOG_FILE
    
    if [ $? -eq 0 ]; then
        log "Seed $seed_name completed successfully"
        return 0
    else
        log "Seed $seed_name failed"
        return 1
    fi
}

# Function to run all seeds
run_all_seeds() {
    log "Running all seeds"
    
    # Array of seeds in order
    local seeds=(
        "RolesSeed"
        "OrganizationsSeed"
        "UsersSeed"
        "DepartmentsSeed"
        "ContactsSeed"
    )
    
    for seed in "${seeds[@]}"; do
        if ! run_seed $seed; then
            log "Failed to run seed $seed"
            return 1
        fi
    done
    
    log "All seeds completed successfully"
    return 0
}

# Function to verify seeds
verify_seeds() {
    log "Verifying seed data"
    
    # Add verification queries for each entity
    local queries=(
        "SELECT COUNT(*) FROM roles"
        "SELECT COUNT(*) FROM organizations"
        "SELECT COUNT(*) FROM users"
        "SELECT COUNT(*) FROM departments"
        "SELECT COUNT(*) FROM contacts"
    )
    
    for query in "${queries[@]}"; do
        local count=$(PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USERNAME -d $DB_NAME -t -c "$query")
        if [ $count -eq 0 ]; then
            log "Verification failed: No data found for query: $query"
            return 1
        fi
    done
    
    log "Seed verification completed successfully"
    return 0
}

# Main execution
log "Starting seed process"

# Check database connection
if ! check_db_connection; then
    log "Database connection failed. Aborting seed process."
    exit 1
fi

# Check if specific seed was requested
if [ ! -z "$1" ]; then
    if ! run_seed $1; then
        log "Failed to run specified seed $1"
        exit 1
    fi
else
    # Run all seeds
    if ! run_all_seeds; then
        log "Failed to run all seeds"
        exit 1
    fi
fi

# Verify seeds
if ! verify_seeds; then
    log "Seed verification failed"
    exit 1
fi

log "Seed process completed successfully"
exit 0