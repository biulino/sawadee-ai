#!/bin/bash

# Multi-Tenant Development Setup Script for SawadeeAI Hotel Management System
# This script sets up the development environment for multi-tenant functionality

set -e

echo "🏨 Setting up Multi-Tenant Development Environment for SawadeeAI Hotel Management System"
echo "=================================================================================="

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   print_error "This script should not be run as root for security reasons"
   exit 1
fi

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
echo -e "\n${BLUE}1. Checking Prerequisites${NC}"
echo "-------------------------"

# Check Node.js
if command_exists node; then
    NODE_VERSION=$(node --version)
    print_status "Node.js found: $NODE_VERSION"
else
    print_error "Node.js is not installed. Please install Node.js 16+ first."
    exit 1
fi

# Check npm
if command_exists npm; then
    NPM_VERSION=$(npm --version)
    print_status "npm found: $NPM_VERSION"
else
    print_error "npm is not installed. Please install npm first."
    exit 1
fi

# Check Java for Spring Boot
if command_exists java; then
    JAVA_VERSION=$(java -version 2>&1 | head -n 1)
    print_status "Java found: $JAVA_VERSION"
else
    print_error "Java is not installed. Please install Java 11+ first."
    exit 1
fi

# Check Maven
if command_exists mvn; then
    MVN_VERSION=$(mvn --version | head -n 1)
    print_status "Maven found: $MVN_VERSION"
else
    print_error "Maven is not installed. Please install Maven first."
    exit 1
fi

# Setup hosts file for local subdomain routing
echo -e "\n${BLUE}2. Setting up Local Domain Routing${NC}"
echo "-----------------------------------"

HOSTS_FILE="/etc/hosts"
HOSTS_ENTRIES=(
    "127.0.0.1 sawadeeai.localhost"
    "127.0.0.1 kapadokya.localhost"
    "127.0.0.1 admin.localhost"
)

print_info "Checking /etc/hosts file for local subdomain entries..."

# Check if hosts entries already exist
MISSING_ENTRIES=()
for entry in "${HOSTS_ENTRIES[@]}"; do
    if ! grep -q "$entry" "$HOSTS_FILE" 2>/dev/null; then
        MISSING_ENTRIES+=("$entry")
    fi
done

if [ ${#MISSING_ENTRIES[@]} -gt 0 ]; then
    print_warning "Some hosts entries are missing. You may need to add them manually."
    echo "Please add these entries to your /etc/hosts file:"
    for entry in "${MISSING_ENTRIES[@]}"; do
        echo "  $entry"
    done
    echo ""
    echo "You can do this by running:"
    echo "  sudo nano /etc/hosts"
    echo "Then add the missing entries above."
    echo ""
    read -p "Press Enter to continue after updating /etc/hosts..."
else
    print_status "All required hosts entries are present"
fi

# Install frontend dependencies
echo -e "\n${BLUE}3. Installing Frontend Dependencies${NC}"
echo "------------------------------------"

cd web-frontend

if [ ! -d "node_modules" ]; then
    print_info "Installing npm dependencies..."
    npm install
    print_status "Frontend dependencies installed"
else
    print_info "Frontend dependencies already installed, updating..."
    npm update
    print_status "Frontend dependencies updated"
fi

# Install backend dependencies
echo -e "\n${BLUE}4. Installing Backend Dependencies${NC}"
echo "-----------------------------------"

cd ../spring-boot-backend

print_info "Installing Maven dependencies..."
mvn clean install -DskipTests
print_status "Backend dependencies installed"

# Setup database (if needed)
echo -e "\n${BLUE}5. Database Setup${NC}"
echo "------------------"

cd ../database

if [ -f "setup_database.sql" ]; then
    print_info "Database setup files found"
    print_warning "Make sure your database is running and configured properly"
    print_info "You can run the database setup scripts manually if needed"
else
    print_warning "No database setup files found in database/ directory"
fi

# Create environment configuration files
echo -e "\n${BLUE}6. Creating Environment Configuration${NC}"
echo "--------------------------------------"

cd ../

# Create frontend environment file if it doesn't exist
if [ ! -f "web-frontend/.env.development" ]; then
    print_info "Creating frontend development environment file..."
    cat > web-frontend/.env.development << EOF
# Development Environment Configuration
REACT_APP_API_BASE_URL=http://localhost:8090/api
REACT_APP_ENVIRONMENT=development

# Multi-tenant Configuration
REACT_APP_BASE_DOMAIN=localhost
REACT_APP_DEFAULT_TENANT=sawadeeai

# Feature Flags
REACT_APP_ENABLE_TENANT_MANAGEMENT=true
REACT_APP_ENABLE_ADMIN_FEATURES=true
EOF
    print_status "Frontend environment file created"
else
    print_status "Frontend environment file already exists"
fi

# Create backend environment file if it doesn't exist
if [ ! -f "spring-boot-backend/src/main/resources/application-dev.properties" ]; then
    print_info "Creating backend development properties file..."
    cat > spring-boot-backend/src/main/resources/application-dev.properties << EOF
# Development Environment Configuration
server.port=8090
spring.profiles.active=dev

# Database Configuration (update as needed)
spring.datasource.url=jdbc:mysql://localhost:3306/hotel_management_dev
spring.datasource.username=root
spring.datasource.password=password
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

# JPA Configuration
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true

# Multi-tenant Configuration
app.tenant.enabled=true
app.tenant.default=sawadeeai

# CORS Configuration
app.cors.allowed-origins=http://localhost:3000,http://sawadeeai.localhost:3000,http://kapadokya.localhost:3000,http://admin.localhost:3000

# Logging
logging.level.com.canermastan.hotel=DEBUG
logging.level.org.hibernate.SQL=DEBUG
EOF
    print_status "Backend environment file created"
else
    print_status "Backend environment file already exists"
fi

# Create startup scripts
echo -e "\n${BLUE}7. Creating Startup Scripts${NC}"
echo "----------------------------"

# Frontend startup script
cat > start-frontend.sh << 'EOF'
#!/bin/bash
echo "🌐 Starting Frontend Development Server"
echo "======================================"
echo "Available tenant URLs:"
echo "  • http://localhost:3000 (Default)"
echo "  • http://sawadeeai.localhost:3000 (SawadeeAI Hotel)"
echo "  • http://kapadokya.localhost:3000 (Kapadokya Hotel)"
echo "  • http://admin.localhost:3000 (Admin Panel)"
echo ""
cd web-frontend
npm start
EOF

# Backend startup script
cat > start-backend.sh << 'EOF'
#!/bin/bash
echo "🚀 Starting Backend Development Server"
echo "======================================"
echo "API will be available at: http://localhost:8090/api"
echo ""
cd spring-boot-backend
mvn spring-boot:run -Dspring-boot.run.profiles=dev
EOF

# Combined startup script
cat > start-dev-servers.sh << 'EOF'
#!/bin/bash
echo "🏨 Starting SawadeeAI Hotel Management Development Servers"
echo "======================================================="

# Function to handle cleanup
cleanup() {
    echo "Shutting down servers..."
    kill $(jobs -p) 2>/dev/null
    exit
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

echo "Starting backend server..."
cd spring-boot-backend
mvn spring-boot:run -Dspring-boot.run.profiles=dev &
BACKEND_PID=$!

echo "Waiting for backend to start..."
sleep 15

echo "Starting frontend server..."
cd ../web-frontend
npm start &
FRONTEND_PID=$!

echo ""
echo "🎉 Development servers are starting!"
echo "=================================="
echo "Backend:  http://localhost:8090/api"
echo "Frontend: http://localhost:3000"
echo ""
echo "Multi-tenant URLs:"
echo "  • http://sawadeeai.localhost:3000 (SawadeeAI Hotel)"
echo "  • http://kapadokya.localhost:3000 (Kapadokya Hotel)" 
echo "  • http://admin.localhost:3000 (Admin Panel)"
echo ""
echo "Press Ctrl+C to stop all servers"

# Wait for either process to finish
wait
EOF

# Make scripts executable
chmod +x start-frontend.sh start-backend.sh start-dev-servers.sh

print_status "Startup scripts created and made executable"

# Create development testing guide
echo -e "\n${BLUE}8. Creating Development Testing Guide${NC}"
echo "--------------------------------------"

cat > MULTI_TENANT_DEV_GUIDE.md << 'EOF'
# Multi-Tenant Development Guide

## Quick Start

1. **Start Development Servers:**
   ```bash
   ./start-dev-servers.sh
   ```

2. **Access Different Tenants:**
   - SawadeeAI Hotel: http://sawadeeai.localhost:3000
   - Kapadokya Hotel: http://kapadokya.localhost:3000
   - Admin Panel: http://admin.localhost:3000
   - Default: http://localhost:3000

## Testing Multi-Tenant Features

### 1. Tenant Context Detection
- Open different tenant URLs and verify the correct tenant configuration loads
- Check browser console for tenant context logs
- Verify API requests include the correct `X-Tenant-ID` header

### 2. Tenant Management (Admin)
- Access admin panel: http://admin.localhost:3000
- Navigate to Back Office → Tenant Management
- Test creating, editing, and deleting tenants
- Verify tenant configurations apply correctly

### 3. Tenant-Specific Theming
- Compare different tenant URLs to see different:
  - Colors and branding
  - Hotel names and configurations
  - Logo displays (if configured)

### 4. API Tenant Isolation
- Use browser developer tools to inspect API requests
- Verify `X-Tenant-ID` header is included in all requests
- Test that data is properly isolated between tenants

## Development Tips

### Using URL Parameters for Testing
Add `?tenant=TENANT_KEY` to any URL for testing:
- http://localhost:3000?tenant=sawadeeai
- http://localhost:3000?tenant=kapadokya

### Environment Variables
Check `web-frontend/.env.development` for configuration options.

### Database Testing
Each tenant should have isolated data. Test by:
1. Creating test data for different tenants
2. Switching between tenant URLs
3. Verifying data isolation

### Debugging
- Check browser console for tenant context logs
- Monitor network tab for API requests with tenant headers
- Use React Developer Tools to inspect TenantContext state

## Common Issues

### 1. Subdomain Not Working
- Verify /etc/hosts entries are correct
- Clear browser cache and DNS cache
- Try using URL parameters as fallback

### 2. API Requests Failing
- Check if backend is running on port 8090
- Verify CORS configuration in backend
- Ensure tenant headers are being sent

### 3. Tenant Config Not Loading
- Check browser console for errors
- Verify API endpoint `/api/tenants/key/{tenantKey}` is working
- Test with different tenant keys

## File Structure

```
web-frontend/src/
├── contexts/
│   └── TenantContext.tsx      # Centralized tenant management
├── services/
│   └── api.ts                 # API service with tenant headers
├── components/
│   └── TenantManagement.tsx   # Admin interface for tenants
├── utils/
│   └── tenantUtils.ts         # Tenant utility functions
└── config/
    └── domainConfig.ts        # Domain routing configuration
```

## Next Steps

1. Set up production domain routing with nginx
2. Implement tenant-specific database schemas
3. Add more tenant customization options
4. Set up monitoring for multi-tenant metrics
EOF

print_status "Multi-tenant development guide created"

# Summary
echo -e "\n${GREEN}🎉 Multi-Tenant Development Environment Setup Complete!${NC}"
echo "====================================================="
echo ""
echo "📁 Files Created:"
echo "  • start-frontend.sh - Frontend development server"
echo "  • start-backend.sh - Backend development server" 
echo "  • start-dev-servers.sh - Combined startup script"
echo "  • MULTI_TENANT_DEV_GUIDE.md - Development guide"
echo "  • web-frontend/.env.development - Frontend config"
echo "  • spring-boot-backend/.../application-dev.properties - Backend config"
echo ""
echo "🚀 To start development:"
echo "  ./start-dev-servers.sh"
echo ""
echo "🌐 Access URLs:"
echo "  • http://sawadeeai.localhost:3000 (SawadeeAI Hotel)"
echo "  • http://kapadokya.localhost:3000 (Kapadokya Hotel)"
echo "  • http://admin.localhost:3000 (Admin Panel)"
echo "  • http://localhost:3000 (Default/Testing)"
echo ""
echo "📖 Read MULTI_TENANT_DEV_GUIDE.md for detailed instructions"
echo ""
print_status "Setup completed successfully!"
