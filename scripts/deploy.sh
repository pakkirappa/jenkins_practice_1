#!/bin/bash

# Deployment script for Jenkins MERN application
# Usage: ./deploy.sh [staging|production]

set -e  # Exit on any error

ENVIRONMENT=${1:-staging}
BUILD_NUMBER=${BUILD_NUMBER:-latest}
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "🚀 Starting deployment to $ENVIRONMENT environment..."
echo "📦 Build Number: $BUILD_NUMBER"
echo "📁 Working Directory: $SCRIPT_DIR"

# Validate environment
if [[ ! "$ENVIRONMENT" =~ ^(staging|production)$ ]]; then
    echo "❌ Error: Environment must be 'staging' or 'production'"
    exit 1
fi

# Check if Docker is running
if ! docker info >/dev/null 2>&1; then
    echo "❌ Error: Docker is not running"
    exit 1
fi

# Load environment variables
if [ -f ".env.$ENVIRONMENT" ]; then
    echo "📋 Loading environment variables from .env.$ENVIRONMENT"
    export $(cat .env.$ENVIRONMENT | grep -v '^#' | xargs)
else
    echo "⚠️ Warning: No .env.$ENVIRONMENT file found, using defaults"
fi

# Set build number
export BUILD_NUMBER=$BUILD_NUMBER

# Pre-deployment checks
echo "🔍 Running pre-deployment checks..."

# Check if images exist
if ! docker image inspect "jenkins-mern-client:$BUILD_NUMBER" >/dev/null 2>&1; then
    echo "❌ Error: Client image jenkins-mern-client:$BUILD_NUMBER not found"
    exit 1
fi

if ! docker image inspect "jenkins-mern-server:$BUILD_NUMBER" >/dev/null 2>&1; then
    echo "❌ Error: Server image jenkins-mern-server:$BUILD_NUMBER not found"
    exit 1
fi

echo "✅ Docker images verified"

# Backup current deployment (production only)
if [ "$ENVIRONMENT" == "production" ]; then
    echo "💾 Creating backup of current production deployment..."
    docker-compose -f docker-compose.prod.yml logs > "backup/logs-$(date +%Y%m%d-%H%M%S).log" 2>/dev/null || true
fi

# Deploy based on environment
echo "🔄 Deploying to $ENVIRONMENT..."

if [ "$ENVIRONMENT" == "staging" ]; then
    # Staging deployment
    docker-compose -f docker-compose.staging.yml down || true
    docker-compose -f docker-compose.staging.yml up -d
    
    # Wait for services to be ready
    echo "⏳ Waiting for staging services to be ready..."
    sleep 30
    
    # Health check
    echo "🏥 Running health checks..."
    if curl -f http://localhost:3001/health >/dev/null 2>&1; then
        echo "✅ Staging deployment successful!"
        echo "🌐 Staging URL: http://localhost:3001"
        echo "🔗 API Health: http://localhost:5001/api/health"
    else
        echo "❌ Health check failed!"
        exit 1
    fi
    
elif [ "$ENVIRONMENT" == "production" ]; then
    # Production deployment with zero-downtime
    echo "🔥 Production deployment starting..."
    
    # Check if production is already running
    if docker-compose -f docker-compose.prod.yml ps | grep -q "Up"; then
        echo "⚠️ Production services are running, performing rolling update..."
        
        # Rolling update strategy
        docker-compose -f docker-compose.prod.yml up -d --no-deps server
        sleep 10
        docker-compose -f docker-compose.prod.yml up -d --no-deps client
        sleep 10
    else
        # Fresh production deployment
        docker-compose -f docker-compose.prod.yml up -d
    fi
    
    # Wait for services
    echo "⏳ Waiting for production services to be ready..."
    sleep 60
    
    # Extended health checks for production
    echo "🏥 Running comprehensive health checks..."
    
    # Check API health
    for i in {1..5}; do
        if curl -f http://localhost/api/health >/dev/null 2>&1; then
            echo "✅ API health check passed (attempt $i)"
            break
        else
            echo "⏳ API not ready, waiting... (attempt $i/5)"
            sleep 10
            if [ $i -eq 5 ]; then
                echo "❌ API health check failed after 5 attempts"
                exit 1
            fi
        fi
    done
    
    # Check frontend
    if curl -f http://localhost/ >/dev/null 2>&1; then
        echo "✅ Frontend health check passed"
    else
        echo "❌ Frontend health check failed"
        exit 1
    fi
    
    echo "🎉 Production deployment successful!"
    echo "🌐 Production URL: http://localhost"
    echo "🔗 API Health: http://localhost/api/health"
fi

# Post-deployment tasks
echo "📊 Post-deployment tasks..."

# Display service status
echo "📋 Service Status:"
if [ "$ENVIRONMENT" == "staging" ]; then
    docker-compose -f docker-compose.staging.yml ps
else
    docker-compose -f docker-compose.prod.yml ps
fi

# Log deployment
echo "$(date): Deployed build $BUILD_NUMBER to $ENVIRONMENT" >> deployments.log

echo "✅ Deployment completed successfully!"

# Cleanup old images (keep last 3 builds)
echo "🧹 Cleaning up old Docker images..."
docker images jenkins-mern-client --format "table {{.Repository}}\t{{.Tag}}\t{{.ID}}" | tail -n +2 | sort -k2 -nr | tail -n +4 | awk '{print $3}' | xargs -r docker rmi || true
docker images jenkins-mern-server --format "table {{.Repository}}\t{{.Tag}}\t{{.ID}}" | tail -n +2 | sort -k2 -nr | tail -n +4 | awk '{print $3}' | xargs -r docker rmi || true

echo "🎊 Deployment to $ENVIRONMENT completed!"