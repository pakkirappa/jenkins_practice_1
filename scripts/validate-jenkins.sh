#!/bin/bash

# Jenkinsfile Validation Script
# This script performs basic validation checks on the Jenkinsfile

echo "🔍 Validating Jenkinsfile..."

JENKINSFILE="Jenkinsfile"

if [ ! -f "$JENKINSFILE" ]; then
    echo "❌ Error: $JENKINSFILE not found"
    exit 1
fi

echo "✅ Jenkinsfile exists"

# Check for required files referenced in Jenkinsfile
echo "🔍 Checking required files..."

REQUIRED_FILES=(
    "client/package.json"
    "server/package.json"
    "docker/Dockerfile.client"
    "docker/Dockerfile.server"
    "docker-compose.test.yml"
    "docker-compose.staging.yml"
    "docker-compose.prod.yml"
)

for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file exists"
    else
        echo "❌ Missing required file: $file"
        exit 1
    fi
done

# Check if npm scripts exist in package.json files
echo "🔍 Checking npm scripts..."

# Check client scripts
if grep -q '"lint"' client/package.json; then
    echo "✅ Client lint script exists"
else
    echo "❌ Missing lint script in client/package.json"
    exit 1
fi

if grep -q '"test:ci"' client/package.json; then
    echo "✅ Client test:ci script exists"
else
    echo "❌ Missing test:ci script in client/package.json"
    exit 1
fi

if grep -q '"build"' client/package.json; then
    echo "✅ Client build script exists"
else
    echo "❌ Missing build script in client/package.json"
    exit 1
fi

# Check server scripts
if grep -q '"test:ci"' server/package.json; then
    echo "✅ Server test:ci script exists"
else
    echo "❌ Missing test:ci script in server/package.json"
    exit 1
fi

echo "🎉 All validation checks passed!"
echo "Your Jenkinsfile is ready to use!"
echo ""
echo "Next steps:"
echo "1. Commit your changes to Git"
echo "2. Set up Jenkins and create a new Pipeline job"
echo "3. Point the job to your repository"
echo "4. Run your first build!"