#!/bin/bash

# SawadeeAI Local Development Setup Script
# This script starts all services locally for development

echo "🚀 Starting SawadeeAI Local Development Environment..."
echo "=================================================="

# Check if required services are running
check_service() {
    local service=$1
    local port=$2
    if nc -z localhost $port 2>/dev/null; then
        echo "✅ $service is running on port $port"
        return 0
    else
        echo "❌ $service is NOT running on port $port"
        return 1
    fi
}

# Check PostgreSQL
echo "📊 Checking PostgreSQL..."
if sudo -u postgres psql -c "SELECT 1;" > /dev/null 2>&1; then
    echo "✅ PostgreSQL is running"
else
    echo "❌ PostgreSQL is not running. Starting..."
    sudo systemctl start postgresql
fi

# Check Redis
echo "🔴 Checking Redis..."
check_service "Redis" 6379

# Check Spring Boot Backend
echo "🍃 Checking Spring Boot Backend..."
check_service "Spring Boot" 8090

# Check AI Agent
echo "🤖 Checking AI Agent..."
check_service "AI Agent" 5050

# Check AI Recommendation System
echo "🧠 Checking AI Recommendation System..."
check_service "AI Recommendation" 5001

# Download and setup Keycloak if not exists
KEYCLOAK_DIR="/opt/keycloak"
KEYCLOAK_VERSION="23.0.0"

if [ ! -d "$KEYCLOAK_DIR" ]; then
    echo "📦 Downloading Keycloak..."
    sudo mkdir -p /opt
    cd /tmp
    wget -q "https://github.com/keycloak/keycloak/releases/download/$KEYCLOAK_VERSION/keycloak-$KEYCLOAK_VERSION.tar.gz"
    sudo tar -xzf "keycloak-$KEYCLOAK_VERSION.tar.gz" -C /opt/
    sudo mv "/opt/keycloak-$KEYCLOAK_VERSION" "$KEYCLOAK_DIR"
    sudo chown -R $(whoami):$(whoami) "$KEYCLOAK_DIR"
    echo "✅ Keycloak downloaded and extracted"
fi

# Start Keycloak locally
echo "🔐 Starting Keycloak on port 8082..."
if check_service "Keycloak" 8082; then
    echo "✅ Keycloak is already running"
else
    echo "Starting Keycloak in development mode..."
    cd "$KEYCLOAK_DIR"
    
    # Set environment variables for Keycloak
    export KEYCLOAK_ADMIN=admin
    export KEYCLOAK_ADMIN_PASSWORD=admin123
    export KC_DB=postgres
    export KC_DB_URL="jdbc:postgresql://localhost:5432/hotel_booking"
    export KC_DB_USERNAME=postgres
    export KC_DB_PASSWORD=hotel_pass123
    export KC_HTTP_PORT=8082
    export KC_HOSTNAME=localhost
    export KC_HTTP_ENABLED=true
    export KC_HOSTNAME_STRICT_HTTPS=false
    
    # Start Keycloak in background
    nohup ./bin/kc.sh start-dev --http-port=8082 > /tmp/keycloak.log 2>&1 &
    echo "🔐 Keycloak starting... (check /tmp/keycloak.log for logs)"
    
    # Wait for Keycloak to start
    echo "⏳ Waiting for Keycloak to start..."
    for i in {1..30}; do
        if check_service "Keycloak" 8082; then
            echo "✅ Keycloak is now running!"
            break
        fi
        sleep 2
        echo "   Waiting... ($i/30)"
    done
fi

# Start React Frontend
echo "⚛️  Starting React Frontend..."
if check_service "React Frontend" 3000; then
    echo "✅ React Frontend is already running"
else
    echo "Starting React development server..."
    cd /home/biulas/DOCKER/sawadee/web-frontend
    
    # Check if node_modules exists
    if [ ! -d "node_modules" ]; then
        echo "📦 Installing npm dependencies..."
        npm install
    fi
    
    # Set environment variables for React
    export REACT_APP_API_URL=http://localhost:8090
    export REACT_APP_AI_AGENT_URL=http://localhost:5050
    export REACT_APP_KEYCLOAK_URL=http://localhost:8082
    export REACT_APP_KEYCLOAK_REALM=hotel-realm
    export REACT_APP_KEYCLOAK_CLIENT_ID=hotel-client
    
    # Start React in background
    nohup npm start > /tmp/react.log 2>&1 &
    echo "⚛️  React starting... (check /tmp/react.log for logs)"
    
    # Wait for React to start
    echo "⏳ Waiting for React to start..."
    for i in {1..20}; do
        if check_service "React Frontend" 3000; then
            echo "✅ React Frontend is now running!"
            break
        fi
        sleep 3
        echo "   Waiting... ($i/20)"
    done
fi

echo ""
echo "🎉 Local Development Environment Status:"
echo "========================================"
echo "🔗 React Frontend:     http://localhost:3000"
echo "🔗 Spring Boot API:    http://localhost:8090"
echo "🔗 Keycloak Admin:     http://localhost:8082"
echo "🔗 AI Agent:           http://localhost:5050"
echo "🔗 AI Recommendation:  http://localhost:5001"
echo ""
echo "📝 Log Files:"
echo "   - Keycloak: /tmp/keycloak.log"
echo "   - React:    /tmp/react.log"
echo ""
echo "🔑 Keycloak Admin Credentials:"
echo "   - Username: admin"
echo "   - Password: admin123"
echo ""
echo "✨ All services are ready for development!"
