# Quick Setup Script for KapadokyaReservation System (PowerShell)
# Run this after Node.js and Java are installed

Write-Host "🚀 KapadokyaReservation Quick Setup" -ForegroundColor Green
Write-Host "==================================" -ForegroundColor Green

# Check prerequisites
Write-Host "📋 Checking prerequisites..." -ForegroundColor Yellow

# Check Node.js
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js found: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js not found. Please install Node.js 18+ first." -ForegroundColor Red
    exit 1
}

# Check npm
try {
    $npmVersion = npm --version
    Write-Host "✅ npm found: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ npm not found. Please install npm first." -ForegroundColor Red
    exit 1
}

# Check Java
try {
    $javaVersion = java --version | Select-Object -First 1
    Write-Host "✅ Java found: $javaVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Java not found. Please install JDK 17+ first." -ForegroundColor Red
    exit 1
}

Write-Host ""

# Setup Frontend
Write-Host "🎨 Setting up Frontend..." -ForegroundColor Yellow
Set-Location "web-frontend"

if (!(Test-Path "package.json")) {
    Write-Host "❌ Frontend package.json not found!" -ForegroundColor Red
    exit 1
}

Write-Host "📦 Installing frontend dependencies..." -ForegroundColor Cyan
npm install

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Frontend dependencies installed successfully" -ForegroundColor Green
} else {
    Write-Host "❌ Frontend dependency installation failed" -ForegroundColor Red
    exit 1
}

Write-Host "🔍 Checking TypeScript compilation..." -ForegroundColor Cyan
npx tsc --noEmit

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ TypeScript compilation successful" -ForegroundColor Green
} else {
    Write-Host "⚠️  TypeScript compilation has errors - check output above" -ForegroundColor Yellow
}

Set-Location ".."

# Setup Backend
Write-Host ""
Write-Host "☕ Setting up Backend..." -ForegroundColor Yellow
Set-Location "spring-boot-backend"

if (!(Test-Path "pom.xml")) {
    Write-Host "❌ Backend pom.xml not found!" -ForegroundColor Red
    exit 1
}

Write-Host "🔨 Compiling Spring Boot application..." -ForegroundColor Cyan
& ".\mvnw.cmd" clean compile

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Backend compilation successful" -ForegroundColor Green
} else {
    Write-Host "❌ Backend compilation failed" -ForegroundColor Red
    exit 1
}

Set-Location ".."

# Final verification
Write-Host ""
Write-Host "🎯 Setup Complete!" -ForegroundColor Green
Write-Host "=================="
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Start backend: cd spring-boot-backend; .\mvnw.cmd spring-boot:run" -ForegroundColor White
Write-Host "2. Start frontend: cd web-frontend; npm start" -ForegroundColor White
Write-Host "3. Open browser to http://localhost:3000" -ForegroundColor White
Write-Host ""
Write-Host "📚 Check AGENT_HANDOFF_GUIDE.md for detailed information" -ForegroundColor Cyan
Write-Host "🐛 If issues occur, check troubleshooting section in the guide" -ForegroundColor Cyan
