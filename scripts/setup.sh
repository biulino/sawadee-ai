#!/bin/bash

# SawadeeAI Project Setup Script
# This script sets up the development environment

set -e  # Exit on any error

echo "🏨 Setting up SawadeeAI Hotel Management System..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_warning "Node.js is not installed. Installing Node.js 18..."
    # Install Node.js using NodeSource repository
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

# Check if Java is installed
if ! command -v java &> /dev/null; then
    print_warning "Java is not installed. Installing OpenJDK 17..."
    sudo apt-get update
    sudo apt-get install -y openjdk-17-jdk
fi

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    print_status "Creating .env file from template..."
    cp .env.example .env
    print_warning "Please edit .env file with your configuration before running the application"
fi

# Create necessary directories
print_status "Creating project directories..."
mkdir -p logs
mkdir -p uploads
mkdir -p backups

# Set up frontend
if [ -d "frontend" ]; then
    print_status "Setting up frontend dependencies..."
    cd frontend
    if [ ! -d "node_modules" ]; then
        npm install
    fi
    cd ..
fi

# Set up mobile app
if [ -d "mobile" ]; then
    print_status "Setting up mobile app dependencies..."
    cd mobile
    if [ ! -d "node_modules" ]; then
        npm install
    fi
    cd ..
fi

# Build backend
if [ -d "backend" ] && [ -f "backend/pom.xml" ]; then
    print_status "Building backend application..."
    cd backend
    if command -v mvn &> /dev/null; then
        ./mvnw clean compile
    else
        print_warning "Maven is not installed. Backend will be built inside Docker container."
    fi
    cd ..
fi

# Create database initialization scripts
print_status "Setting up database scripts..."
cat > database/init/01-create-databases.sql << EOF
-- Create main application database
CREATE DATABASE sawadee_hotel;

-- Create Keycloak database
CREATE DATABASE keycloak;

-- Create test database
CREATE DATABASE sawadee_hotel_test;
EOF

# Set up Docker network
print_status "Creating Docker network..."
docker network create sawadee-network 2>/dev/null || true

# Pull required Docker images
print_status "Pulling Docker images..."
docker-compose pull

print_status "✅ Setup completed successfully!"
print_status ""
print_status "📋 Next steps:"
print_status "1. Edit .env file with your configuration"
print_status "2. Run 'docker-compose up -d' to start all services"
print_status "3. Access the application at:"
print_status "   - Frontend: http://localhost:3000"
print_status "   - Backend API: http://localhost:8080"
print_status "   - Keycloak Admin: http://localhost:8082"
print_status ""
print_status "🔧 Development commands:"
print_status "   - Start all services: docker-compose up -d"
print_status "   - View logs: docker-compose logs -f"
print_status "   - Stop all services: docker-compose down"
print_status "   - Run tests: ./scripts/test.sh"
print_status ""
print_status "📖 For more information, check the README.md file"
