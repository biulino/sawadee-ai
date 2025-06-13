# KapadokyaReservation Production Deployment Script for Windows PowerShell
# Usage: .\deploy-production.ps1 [environment]

param(
    [string]$Environment = "production"
)

# Configu            $response = Invoke-WebRequest -Uri "http://localhost:5050/health" -TimeoutSec 10ation
$ProjectName = "kapadokya-rese            Write-Log "   AI Agent: http://localhost:5050"vation"
$BackupDir = ".\backups\$(Get-Date -Format 'yyyyMMdd_HHmmss')"
$LogFile = ".\deployment.log"

# Logging functions
function Write-Log {
    param([string]$Message)
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logMessage = "[$timestamp] $Message"
    Write-Host $logMessage -ForegroundColor Green
    Add-Content -Path $LogFile -Value $logMessage
}

function Write-Error-Log {
    param([string]$Message)
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logMessage = "[ERROR] [$timestamp] $Message"
    Write-Host $logMessage -ForegroundColor Red
    Add-Content -Path $LogFile -Value $logMessage
    exit 1
}

function Write-Warning-Log {
    param([string]$Message)
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logMessage = "[WARNING] [$timestamp] $Message"
    Write-Host $logMessage -ForegroundColor Yellow
    Add-Content -Path $LogFile -Value $logMessage
}

# Pre-deployment checks
function Test-PreDeployment {
    Write-Log "Starting pre-deployment checks..."
    
    # Check if Docker is running
    try {
        docker info | Out-Null
    }
    catch {
        Write-Error-Log "Docker is not running. Please start Docker and try again."
    }
    
    # Check if environment file exists
    if (-not (Test-Path ".env.$Environment")) {
        Write-Error-Log "Environment file .env.$Environment not found!"
    }
    
    # Check if SSL certificates exist for production
    if ($Environment -eq "production") {
        if (-not (Test-Path "nginx\ssl\cert.pem") -or -not (Test-Path "nginx\ssl\private.key")) {
            Write-Error-Log "SSL certificates not found in nginx\ssl\ directory!"
        }
    }
    
    # Check available disk space (require at least 5GB)
    $drive = Get-WmiObject -Class Win32_LogicalDisk -Filter "DeviceID='C:'"
    $freeSpaceGB = [math]::Round($drive.FreeSpace / 1GB, 2)
    if ($freeSpaceGB -lt 5) {
        Write-Error-Log "Insufficient disk space. At least 5GB required. Available: $freeSpaceGB GB"
    }
    
    Write-Log "Pre-deployment checks completed successfully"
}

# Create backup
function New-Backup {
    Write-Log "Creating backup..."
    
    New-Item -ItemType Directory -Path $BackupDir -Force | Out-Null
    
    # Backup database
    $postgresContainer = docker ps --filter "name=$ProjectName-postgres" --format "{{.Names}}"
    if ($postgresContainer) {
        Write-Log "Backing up database..."
        docker exec $postgresContainer pg_dump -U $env:DB_USER hotel_reservation > "$BackupDir\database_backup.sql"
    }
    
    # Backup uploads directory
    if (Test-Path ".\uploads") {
        Write-Log "Backing up uploads..."
        Copy-Item -Path ".\uploads" -Destination $BackupDir -Recurse
    }
    
    # Backup configuration files
    Copy-Item -Path ".env.$Environment" -Destination $BackupDir
    
    Write-Log "Backup created at $BackupDir"
}

# Database migration
function Invoke-DatabaseMigration {
    Write-Log "Running database migrations..."
    
    # Wait for database to be ready
    Write-Log "Waiting for database to be ready..."
    $retryCount = 0
    do {
        Start-Sleep -Seconds 2
        $retryCount++
        $dbReady = docker exec "$ProjectName-postgres" pg_isready -U $env:DB_USER
    } while ($LASTEXITCODE -ne 0 -and $retryCount -lt 30)
    
    if ($LASTEXITCODE -ne 0) {
        Write-Error-Log "Database failed to become ready after 60 seconds"
    }
    
    # Run schema updates
    docker exec "$ProjectName-postgres" psql -U $env:DB_USER -d hotel_reservation -f /docker-entrypoint-initdb.d/complete_schema.sql
    
    Write-Log "Database migrations completed"
}

# Build and deploy services
function Deploy-Services {
    Write-Log "Building and deploying services..."
    
    # Copy environment file
    Copy-Item -Path ".env.$Environment" -Destination ".env" -Force
    
    # Build and start services
    docker-compose -f docker-compose.yml --env-file ".env.$Environment" down --remove-orphans
    docker-compose -f docker-compose.yml --env-file ".env.$Environment" build --no-cache
    docker-compose -f docker-compose.yml --env-file ".env.$Environment" up -d
    
    Write-Log "Services deployed successfully"
}

# Health checks
function Test-HealthChecks {
    Write-Log "Running health checks..."
    
    # Wait for services to start
    Start-Sleep -Seconds 30
    
    # Check database health
    $dbHealth = docker exec "$ProjectName-postgres" pg_isready -U $env:DB_USER
    if ($LASTEXITCODE -ne 0) {
        Write-Error-Log "Database health check failed"
    }
    
    # Check backend health
    $backendHealthy = $false
    for ($i = 1; $i -le 30; $i++) {
        try {
            $response = Invoke-WebRequest -Uri "http://localhost:8090/actuator/health" -TimeoutSec 10
            if ($response.StatusCode -eq 200) {
                Write-Log "Backend health check passed"
                $backendHealthy = $true
                break
            }
        }
        catch {
            if ($i -eq 30) {
                Write-Error-Log "Backend health check failed after 30 attempts"
            }
            Start-Sleep -Seconds 10
        }
    }
    
    # Check frontend accessibility
    $frontendHealthy = $false
    for ($i = 1; $i -le 30; $i++) {
        try {
            $response = Invoke-WebRequest -Uri "http://localhost:3000" -TimeoutSec 10
            if ($response.StatusCode -eq 200) {
                Write-Log "Frontend health check passed"
                $frontendHealthy = $true
                break
            }
        }
        catch {
            if ($i -eq 30) {
                Write-Error-Log "Frontend health check failed after 30 attempts"
            }
            Start-Sleep -Seconds 10
        }
    }
    
    # Check AI agent
    for ($i = 1; $i -le 30; $i++) {
        try {
            $response = Invoke-WebRequest -Uri "http://localhost:5050/health" -TimeoutSec 10
            if ($response.StatusCode -eq 200) {
                Write-Log "AI Agent health check passed"
                break
            }
        }
        catch {
            if ($i -eq 30) {
                Write-Warning-Log "AI Agent health check failed - continuing anyway"
                break
            }
            Start-Sleep -Seconds 10
        }
    }
    
    Write-Log "Health checks completed"
}

# Post-deployment tasks
function Invoke-PostDeploymentTasks {
    Write-Log "Running post-deployment tasks..."
    
    # Load initial data if needed
    if ($Environment -eq "production") {
        Write-Log "Loading production data..."
        # Add any production data loading scripts here
    }
    else {
        Write-Log "Loading test data..."
        # Load test data for development/staging
        docker exec "$ProjectName-backend" java -jar app.jar --load-test-data
    }
    
    # Clear caches
    Write-Log "Clearing application caches..."
    docker exec "$ProjectName-redis" redis-cli FLUSHALL
    
    # Send deployment notification (if configured)
    if ($env:SLACK_WEBHOOK_URL) {
        $body = @{
            text = "✅ KapadokyaReservation deployed successfully to $Environment"
        } | ConvertTo-Json
        
        try {
            Invoke-RestMethod -Uri $env:SLACK_WEBHOOK_URL -Method Post -Body $body -ContentType "application/json"
        }
        catch {
            Write-Warning-Log "Failed to send Slack notification: $_"
        }
    }
    
    Write-Log "Post-deployment tasks completed"
}

# Rollback function
function Invoke-Rollback {
    param([string]$ErrorMessage)
    
    Write-Warning-Log "Deployment failed: $ErrorMessage"
    Write-Warning-Log "Initiating rollback..."
    
    # Stop current containers
    docker-compose down
    
    # Restore from backup if available
    if (Test-Path $BackupDir) {
        Write-Log "Restoring from backup..."
        
        # Restore database
        if (Test-Path "$BackupDir\database_backup.sql") {
            Get-Content "$BackupDir\database_backup.sql" | docker exec -i "$ProjectName-postgres" psql -U $env:DB_USER -d hotel_reservation
        }
        
        # Restore uploads
        if (Test-Path "$BackupDir\uploads") {
            if (Test-Path ".\uploads") {
                Remove-Item -Path ".\uploads" -Recurse -Force
            }
            Copy-Item -Path "$BackupDir\uploads" -Destination ".\uploads" -Recurse
        }
        
        Write-Log "Rollback completed"
    }
    else {
        Write-Warning-Log "No backup available for rollback"
    }
    
    exit 1
}

# Cleanup old backups (keep last 10)
function Remove-OldBackups {
    Write-Log "Cleaning up old backups..."
    
    if (Test-Path ".\backups") {
        $backups = Get-ChildItem -Path ".\backups" | Sort-Object CreationTime -Descending
        if ($backups.Count -gt 10) {
            $backups[10..($backups.Count - 1)] | Remove-Item -Recurse -Force
        }
    }
    
    Write-Log "Old backups cleaned up"
}

# Main deployment process
function Start-Deployment {
    Write-Log "Starting deployment to $Environment environment"
    
    try {
        Test-PreDeployment
        New-Backup
        Deploy-Services
        Invoke-DatabaseMigration
        Test-HealthChecks
        Invoke-PostDeploymentTasks
        Remove-OldBackups
        
        Write-Log "🎉 Deployment to $Environment completed successfully!"
        Write-Log "🌐 Application is available at:"
        
        if ($Environment -eq "production") {
            Write-Log "   Frontend: https://kapadokyareservation.com"
            Write-Log "   Admin: https://admin.kapadokyareservation.com"
            Write-Log "   API: https://kapadokyareservation.com/api"
        }
        else {
            Write-Log "   Frontend: http://localhost:3000"
            Write-Log "   Admin: http://localhost:3000/admin"
            Write-Log "   API: http://localhost:8090/api"
            Write-Log "   AI Agent: http://localhost:5050"
        }
        
        Write-Log "📊 Monitoring:"
        Write-Log "   Health: http://localhost:8090/actuator/health"
        Write-Log "   Metrics: http://localhost:8090/actuator/metrics"
        
        # Display container status
        Write-Log "📋 Container Status:"
        docker-compose ps
    }
    catch {
        Invoke-Rollback $_.Exception.Message
    }
}

# Show help
if ($args -contains "--help" -or $args -contains "-h") {
    Write-Host "Usage: .\deploy-production.ps1 [environment]"
    Write-Host "Environments: development, staging, production"
    Write-Host "Default: production"
    exit 0
}

# Load environment variables
if (Test-Path ".env.$Environment") {
    Get-Content ".env.$Environment" | ForEach-Object {
        if ($_ -match '^([^=]+)=(.*)$') {
            [Environment]::SetEnvironmentVariable($matches[1], $matches[2], "Process")
        }
    }
}

# Start deployment
Start-Deployment
