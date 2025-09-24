# Jenkinsfile Validation Script for Windows PowerShell
# This script performs basic validation checks on the Jenkinsfile

Write-Host "🔍 Validating Jenkinsfile..." -ForegroundColor Cyan

$JENKINSFILE = "Jenkinsfile"

if (-not (Test-Path $JENKINSFILE)) {
    Write-Host "❌ Error: $JENKINSFILE not found" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Jenkinsfile exists" -ForegroundColor Green

# Check for required files referenced in Jenkinsfile
Write-Host "🔍 Checking required files..." -ForegroundColor Cyan

$REQUIRED_FILES = @(
    "client\package.json",
    "server\package.json", 
    "docker\Dockerfile.client",
    "docker\Dockerfile.server",
    "docker-compose.test.yml",
    "docker-compose.staging.yml", 
    "docker-compose.prod.yml"
)

foreach ($file in $REQUIRED_FILES) {
    if (Test-Path $file) {
        Write-Host "✅ $file exists" -ForegroundColor Green
    } else {
        Write-Host "❌ Missing required file: $file" -ForegroundColor Red
        exit 1
    }
}

# Check if npm scripts exist in package.json files
Write-Host "🔍 Checking npm scripts..." -ForegroundColor Cyan

# Check client scripts
$clientPackage = Get-Content "client\package.json" -Raw
if ($clientPackage -match '"lint"') {
    Write-Host "✅ Client lint script exists" -ForegroundColor Green
} else {
    Write-Host "❌ Missing lint script in client/package.json" -ForegroundColor Red
    exit 1
}

if ($clientPackage -match '"test:ci"') {
    Write-Host "✅ Client test:ci script exists" -ForegroundColor Green
} else {
    Write-Host "❌ Missing test:ci script in client/package.json" -ForegroundColor Red
    exit 1
}

if ($clientPackage -match '"build"') {
    Write-Host "✅ Client build script exists" -ForegroundColor Green
} else {
    Write-Host "❌ Missing build script in client/package.json" -ForegroundColor Red
    exit 1
}

# Check server scripts
$serverPackage = Get-Content "server\package.json" -Raw
if ($serverPackage -match '"test:ci"') {
    Write-Host "✅ Server test:ci script exists" -ForegroundColor Green
} else {
    Write-Host "❌ Missing test:ci script in server/package.json" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🎉 All validation checks passed!" -ForegroundColor Green
Write-Host "Your Jenkinsfile is ready to use!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Commit your changes to Git" -ForegroundColor White
Write-Host "2. Set up Jenkins and create a new Pipeline job" -ForegroundColor White
Write-Host "3. Point the job to your repository" -ForegroundColor White
Write-Host "4. Run your first build!" -ForegroundColor White