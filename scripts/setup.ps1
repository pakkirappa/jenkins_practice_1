# Setup script for Jenkins MERN Learning Project
# Run this script to set up your development environment

Write-Host "🚀 Setting up Jenkins MERN Learning Project..." -ForegroundColor Cyan

# Check prerequisites
Write-Host "🔍 Checking prerequisites..." -ForegroundColor Yellow

# Check Node.js
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js found: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js not found. Please install Node.js from https://nodejs.org/" -ForegroundColor Red
    exit 1
}

# Check npm
try {
    $npmVersion = npm --version
    Write-Host "✅ npm found: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ npm not found. Please install Node.js from https://nodejs.org/" -ForegroundColor Red
    exit 1
}

# Check Docker
try {
    $dockerVersion = docker --version
    Write-Host "✅ Docker found: $dockerVersion" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Docker not found. Install Docker Desktop for full functionality" -ForegroundColor Yellow
}

# Install client dependencies
Write-Host "📦 Installing client dependencies..." -ForegroundColor Cyan
Set-Location "client"
npm install
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Client dependencies installed successfully" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to install client dependencies" -ForegroundColor Red
    exit 1
}

# Install server dependencies
Write-Host "📦 Installing server dependencies..." -ForegroundColor Cyan
Set-Location "..\server"
npm install
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Server dependencies installed successfully" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to install server dependencies" -ForegroundColor Red
    exit 1
}

Set-Location ".."

# Create environment file if it doesn't exist
if (-not (Test-Path "server\.env")) {
    Write-Host "📋 Creating environment file..." -ForegroundColor Cyan
    Copy-Item "server\.env.example" "server\.env"
    Write-Host "✅ Environment file created: server\.env" -ForegroundColor Green
    Write-Host "💡 You can edit server\.env to customize your settings" -ForegroundColor Blue
}

Write-Host ""
Write-Host "🎉 Setup completed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Start development servers:" -ForegroundColor White
Write-Host "   npm run dev (in server directory)" -ForegroundColor Gray
Write-Host "   npm start (in client directory)" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Or start with Docker:" -ForegroundColor White
Write-Host "   docker-compose up -d" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Access your application:" -ForegroundColor White
Write-Host "   Frontend: http://localhost:3000" -ForegroundColor Gray
Write-Host "   Backend API: http://localhost:5000/api/health" -ForegroundColor Gray
Write-Host "   Jenkins: http://localhost:8080 (after docker-compose up)" -ForegroundColor Gray
Write-Host ""
Write-Host "4. Read the documentation:" -ForegroundColor White
Write-Host "   docs\getting-started.md" -ForegroundColor Gray
Write-Host "   docs\jenkins-setup.md" -ForegroundColor Gray