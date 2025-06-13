#!/bin/bash
# Quick Setup Script for KapadokyaReservation System
# Run this after Node.js and Java are installed

echo "🚀 KapadokyaReservation Quick Setup"
echo "=================================="

# Check prerequisites
echo "📋 Checking prerequisites..."

# Check Node.js
if command -v node >/dev/null 2>&1; then
    echo "✅ Node.js found: $(node --version)"
else
    echo "❌ Node.js not found. Please install Node.js 18+ first."
    exit 1
fi

# Check npm
if command -v npm >/dev/null 2>&1; then
    echo "✅ npm found: $(npm --version)"
else
    echo "❌ npm not found. Please install npm first."
    exit 1
fi

# Check Java
if command -v java >/dev/null 2>&1; then
    echo "✅ Java found: $(java --version | head -1)"
else
    echo "❌ Java not found. Please install JDK 17+ first."
    exit 1
fi

echo ""

# Setup Frontend
echo "🎨 Setting up Frontend..."
cd "web-frontend"

if [ ! -f "package.json" ]; then
    echo "❌ Frontend package.json not found!"
    exit 1
fi

echo "📦 Installing frontend dependencies..."
npm install

if [ $? -eq 0 ]; then
    echo "✅ Frontend dependencies installed successfully"
else
    echo "❌ Frontend dependency installation failed"
    exit 1
fi

echo "🔍 Checking TypeScript compilation..."
npx tsc --noEmit

if [ $? -eq 0 ]; then
    echo "✅ TypeScript compilation successful"
else
    echo "⚠️  TypeScript compilation has errors - check output above"
fi

cd ..

# Setup Backend
echo ""
echo "☕ Setting up Backend..."
cd "spring-boot-backend"

if [ ! -f "pom.xml" ]; then
    echo "❌ Backend pom.xml not found!"
    exit 1
fi

echo "🔨 Compiling Spring Boot application..."
./mvnw clean compile

if [ $? -eq 0 ]; then
    echo "✅ Backend compilation successful"
else
    echo "❌ Backend compilation failed"
    exit 1
fi

cd ..

# Final verification
echo ""
echo "🎯 Setup Complete!"
echo "=================="
echo ""
echo "Next steps:"
echo "1. Start backend: cd spring-boot-backend && ./mvnw spring-boot:run"
echo "2. Start frontend: cd web-frontend && npm start"
echo "3. Open browser to http://localhost:3000"
echo ""
echo "📚 Check AGENT_HANDOFF_GUIDE.md for detailed information"
echo "🐛 If issues occur, check troubleshooting section in the guide"
