#!/bin/bash

# KapadokyaReservation Production Deployment Script
# Usage: ./deploy-production.sh [environment]

set -e

# Configuration
ENVIRONMENT=${1:-production}
PROJECT_NAME="kapadokya-reservation"
BACKUP_DIR="./backups/$(date +%Y%m%d_%H%M%S)"
LOG_FILE="./deployment.log"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a $LOG_FILE
}

error() {
    echo -e "${RED}[ERROR] $1${NC}" | tee -a $LOG_FILE
    exit 1
}

warning() {
    echo -e "${YELLOW}[WARNING] $1${NC}" | tee -a $LOG_FILE
}

# Pre-deployment checks
pre_deployment_checks() {
    log "Starting pre-deployment checks..."
    
    # Check if Docker is running
    if ! docker info >/dev/null 2>&1; then
        error "Docker is not running. Please start Docker and try again."
    fi
    
    # Check if environment file exists
    if [ ! -f ".env.${ENVIRONMENT}" ]; then
        error "Environment file .env.${ENVIRONMENT} not found!"
    fi
    
    # Check if SSL certificates exist for production
    if [ "$ENVIRONMENT" = "production" ]; then
        if [ ! -f "nginx/ssl/cert.pem" ] || [ ! -f "nginx/ssl/private.key" ]; then
            error "SSL certificates not found in nginx/ssl/ directory!"
        fi
    fi
    
    # Check available disk space (require at least 5GB)
    AVAILABLE_SPACE=$(df . | tail -1 | awk '{print $4}')
    if [ $AVAILABLE_SPACE -lt 5242880 ]; then
        error "Insufficient disk space. At least 5GB required."
    fi
    
    log "Pre-deployment checks completed successfully"
}

# Create backup
create_backup() {
    log "Creating backup..."
    
    mkdir -p $BACKUP_DIR
    
    # Backup database
    if docker ps | grep -q "${PROJECT_NAME}-postgres"; then
        log "Backing up database..."
        docker exec ${PROJECT_NAME}-postgres pg_dump -U $DB_USER hotel_reservation > $BACKUP_DIR/database_backup.sql
    fi
    
    # Backup uploads directory
    if [ -d "./uploads" ]; then
        log "Backing up uploads..."
        cp -r ./uploads $BACKUP_DIR/
    fi
    
    # Backup configuration files
    cp .env.${ENVIRONMENT} $BACKUP_DIR/
    
    log "Backup created at $BACKUP_DIR"
}

# Database migration
run_database_migration() {
    log "Running database migrations..."
    
    # Wait for database to be ready
    log "Waiting for database to be ready..."
    until docker exec ${PROJECT_NAME}-postgres pg_isready -U $DB_USER; do
        sleep 2
    done
    
    # Run schema updates
    docker exec ${PROJECT_NAME}-postgres psql -U $DB_USER -d hotel_reservation -f /docker-entrypoint-initdb.d/complete_schema.sql
    
    log "Database migrations completed"
}

# Build and deploy services
deploy_services() {
    log "Building and deploying services..."
    
    # Copy environment file
    cp .env.${ENVIRONMENT} .env
    
    # Build and start services
    docker-compose -f docker-compose.yml --env-file .env.${ENVIRONMENT} down --remove-orphans
    docker-compose -f docker-compose.yml --env-file .env.${ENVIRONMENT} build --no-cache
    docker-compose -f docker-compose.yml --env-file .env.${ENVIRONMENT} up -d
    
    log "Services deployed successfully"
}

# Health checks
run_health_checks() {
    log "Running health checks..."
    
    # Wait for services to start
    sleep 30
    
    # Check database health
    if ! docker exec ${PROJECT_NAME}-postgres pg_isready -U $DB_USER; then
        error "Database health check failed"
    fi
    
    # Check backend health
    for i in {1..30}; do
        if curl -f http://localhost:8090/actuator/health >/dev/null 2>&1; then
            log "Backend health check passed"
            break
        fi
        if [ $i -eq 30 ]; then
            error "Backend health check failed after 30 attempts"
        fi
        sleep 10
    done
    
    # Check frontend accessibility
    for i in {1..30}; do
        if curl -f http://localhost:3000 >/dev/null 2>&1; then
            log "Frontend health check passed"
            break
        fi
        if [ $i -eq 30 ]; then
            error "Frontend health check failed after 30 attempts"
        fi
        sleep 10
    done
    
    # Check AI agent
    for i in {1..30}; do
        if curl -f http://localhost:5050/health >/dev/null 2>&1; then
            log "AI Agent health check passed"
            break
        fi
        if [ $i -eq 30 ]; then
            warning "AI Agent health check failed - continuing anyway"
            break
        fi
        sleep 10
    done
    
    log "Health checks completed"
}

# Post-deployment tasks
post_deployment_tasks() {
    log "Running post-deployment tasks..."
    
    # Load initial data if needed
    if [ "$ENVIRONMENT" = "production" ]; then
        log "Loading production data..."
        # Add any production data loading scripts here
    else
        log "Loading test data..."
        # Load test data for development/staging
        docker exec ${PROJECT_NAME}-backend java -jar app.jar --load-test-data
    fi
    
    # Clear caches
    log "Clearing application caches..."
    docker exec ${PROJECT_NAME}-redis redis-cli FLUSHALL
    
    # Send deployment notification (if configured)
    if [ ! -z "$SLACK_WEBHOOK_URL" ]; then
        curl -X POST -H 'Content-type: application/json' \
            --data "{\"text\":\"✅ KapadokyaReservation deployed successfully to $ENVIRONMENT\"}" \
            $SLACK_WEBHOOK_URL
    fi
    
    log "Post-deployment tasks completed"
}

# Rollback function
rollback() {
    error_msg=$1
    warning "Deployment failed: $error_msg"
    warning "Initiating rollback..."
    
    # Stop current containers
    docker-compose down
    
    # Restore from backup if available
    if [ -d "$BACKUP_DIR" ]; then
        log "Restoring from backup..."
        
        # Restore database
        if [ -f "$BACKUP_DIR/database_backup.sql" ]; then
            docker exec ${PROJECT_NAME}-postgres psql -U $DB_USER -d hotel_reservation < $BACKUP_DIR/database_backup.sql
        fi
        
        # Restore uploads
        if [ -d "$BACKUP_DIR/uploads" ]; then
            rm -rf ./uploads
            cp -r $BACKUP_DIR/uploads ./
        fi
        
        log "Rollback completed"
    else
        warning "No backup available for rollback"
    fi
    
    exit 1
}

# Cleanup old backups (keep last 10)
cleanup_old_backups() {
    log "Cleaning up old backups..."
    ls -t ./backups/ | tail -n +11 | xargs -r rm -rf --
    log "Old backups cleaned up"
}

# Main deployment process
main() {
    log "Starting deployment to $ENVIRONMENT environment"
    
    # Trap errors and rollback
    trap 'rollback "Unexpected error occurred"' ERR
    
    pre_deployment_checks
    create_backup
    deploy_services
    run_database_migration
    run_health_checks
    post_deployment_tasks
    cleanup_old_backups
    
    log "🎉 Deployment to $ENVIRONMENT completed successfully!"
    log "🌐 Application is available at:"
    
    if [ "$ENVIRONMENT" = "production" ]; then
        log "   Frontend: https://kapadokyareservation.com"
        log "   Admin: https://admin.kapadokyareservation.com"
        log "   API: https://kapadokyareservation.com/api"
    else
        log "   Frontend: http://localhost:3000"
        log "   Admin: http://localhost:3000/admin"
        log "   API: http://localhost:8090/api"
        log "   AI Agent: http://localhost:5050"
    fi
    
    log "📊 Monitoring:"
    log "   Health: http://localhost:8090/actuator/health"
    log "   Metrics: http://localhost:8090/actuator/metrics"
    
    # Display container status
    log "📋 Container Status:"
    docker-compose ps
}

# Script execution
if [ "$1" = "--help" ] || [ "$1" = "-h" ]; then
    echo "Usage: $0 [environment]"
    echo "Environments: development, staging, production"
    echo "Default: production"
    exit 0
fi

main
