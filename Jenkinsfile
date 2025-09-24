pipeline {
    agent any
    
    tools {
        // This is the recommended way - requires NodeJS plugin to be installed in Jenkins
        nodejs 'NodeJS-18' // This name should match your Jenkins tool configuration
    }
    
    environment {
        // Define environment variables
        NODE_VERSION = '18'
        MONGODB_URI = 'mongodb://mongo:27017/jenkins_mern_db'
        // Note: BUILD_NUMBER and GIT_COMMIT are automatically available as env.BUILD_NUMBER and env.GIT_COMMIT
        DOCKER_REGISTRY = 'jenkins-mern'
        APP_NAME = 'jenkins-mern-app'
        // Set npm cache to workspace to avoid permission issues
        NPM_CONFIG_CACHE = "${WORKSPACE}/.npm-cache"
    }
    
    stages {
        stage('Verify Environment') {
            steps {
                script {
                    echo "� Verifying build environment..."
                    
                    // Check if required tools are available
                    sh '''
                        echo "Git version: $(git --version)"
                        echo "Node.js version: $(node --version)"
                        echo "npm version: $(npm --version)"
                        echo "Docker version: $(docker --version || echo 'Docker not available')"
                    '''
                    
                    // Set npm cache to workspace to avoid permission issues
                    sh 'npm config set cache ${WORKSPACE}/.npm-cache'
                    
                    echo "✅ Environment verification completed"
                }
            }
        }
        
        stage('Install Dependencies') {
            parallel {
                stage('Install Client Dependencies') {
                    steps {
                        script {
                            echo '📦 Installing React client dependencies...'
                            dir('client') {
                                sh 'npm ci'
                            }
                        }
                    }
                }
                stage('Install Server Dependencies') {
                    steps {
                        script {
                            echo "📦 Installing Node.js server dependencies..."
                            dir('server') {
                                sh 'npm ci'
                            }
                        }
                    }
                }
            }
        }
        
        stage('Lint and Code Quality') {
            parallel {
                stage('Lint Client') {
                    steps {
                        script {
                            echo "🔍 Running ESLint on React client..."
                            dir('client') {
                                sh '''
                                    if npm run lint; then
                                        echo "✅ Linting passed"
                                    else
                                        echo "⚠️ Linting completed with warnings or errors"
                                        exit 0
                                    fi
                                '''
                            }
                        }
                    }
                }
                stage('Security Audit') {
                    steps {
                        script {
                            echo "🛡️ Running security audit..."
                            dir('client') {
                                sh 'npm audit --audit-level=high || echo "Security audit completed"'
                            }
                            dir('server') {
                                sh 'npm audit --audit-level=high || echo "Security audit completed"'
                            }
                        }
                    }
                }
            }
        }
        
        stage('Build') {
            parallel {
                stage('Build Client') {
                    steps {
                        script {
                            echo "🏗️ Building React application..."
                            dir('client') {
                                sh 'npm run build'
                            }
                        }
                    }
                    post {
                        success {
                            echo "✅ Client build successful!"
                            archiveArtifacts artifacts: 'client/build/**/*', fingerprint: true
                        }
                    }
                }
                stage('Prepare Server') {
                    steps {
                        script {
                            echo "🔧 Preparing server for deployment..."
                            dir('server') {
                                sh 'echo "Server preparation completed"'
                            }
                        }
                    }
                }
            }
        }
        
        stage('Test') {
            parallel {
                stage('Test Client') {
                    steps {
                        script {
                            echo "🧪 Running React tests..."
                            dir('client') {
                                sh 'npm run test:ci'
                            }
                        }
                    }
                    post {
                        always {
                            publishHTML([
                                allowMissing: false,
                                alwaysLinkToLastBuild: true,
                                keepAll: true,
                                reportDir: 'client/coverage',
                                reportFiles: 'index.html',
                                reportName: 'Client Test Coverage'
                            ])
                        }
                    }
                }
                stage('Test Server') {
                    steps {
                        script {
                            echo "🧪 Running Node.js tests..."
                            dir('server') {
                                sh 'npm run test:ci'
                            }
                        }
                    }
                    post {
                        always {
                            publishTestResults testResultsPattern: 'server/coverage/lcov.info'
                        }
                    }
                }
            }
        }
        
        stage('Docker Build') {
            when {
                anyOf {
                    branch 'main'
                    branch 'develop'
                }
            }
            parallel {
                stage('Build Client Image') {
                    steps {
                        script {
                            echo "🐳 Building Docker image for client..."
                            sh """
                                docker build -t ${DOCKER_REGISTRY}-client:${env.BUILD_NUMBER} -f docker/Dockerfile.client .
                                docker tag ${DOCKER_REGISTRY}-client:${env.BUILD_NUMBER} ${DOCKER_REGISTRY}-client:latest
                                echo "✅ Client Docker image built: ${DOCKER_REGISTRY}-client:${env.BUILD_NUMBER}"
                            """
                        }
                    }
                }
                stage('Build Server Image') {
                    steps {
                        script {
                            echo "🐳 Building Docker image for server..."
                            sh """
                                docker build -t ${DOCKER_REGISTRY}-server:${env.BUILD_NUMBER} -f docker/Dockerfile.server .
                                docker tag ${DOCKER_REGISTRY}-server:${env.BUILD_NUMBER} ${DOCKER_REGISTRY}-server:latest
                                echo "✅ Server Docker image built: ${DOCKER_REGISTRY}-server:${env.BUILD_NUMBER}"
                            """
                        }
                    }
                }
            }
        }
        
        stage('Integration Tests') {
            when {
                anyOf {
                    branch 'main'
                    branch 'develop'
                }
            }
            steps {
                script {
                    echo "🔗 Running integration tests..."
                    sh 'docker-compose -f docker-compose.test.yml up --build --abort-on-container-exit'
                }
            }
            post {
                always {
                    sh 'docker-compose -f docker-compose.test.yml down'
                }
            }
        }
        
        stage('Deploy to Staging') {
            when {
                branch 'develop'
            }
            steps {
                script {
                    echo "🚀 Deploying to staging environment..."
                    sh """
                        export BUILD_NUMBER=${env.BUILD_NUMBER}
                        export GIT_COMMIT=${env.GIT_COMMIT}
                        docker-compose -f docker-compose.staging.yml down || true
                        docker-compose -f docker-compose.staging.yml up -d
                        echo "✅ Staging deployment completed"
                    """
                }
            }
        }
        
        stage('Deploy to Production') {
            when {
                branch 'main'
            }
            steps {
                script {
                    echo "🌟 Deploying to production environment..."
                    timeout(time: 5, unit: 'MINUTES') {
                        input message: 'Deploy to production?', ok: 'Deploy',
                              submitterParameter: 'DEPLOYER'
                    }
                    echo "Deployment approved by: ${env.DEPLOYER}"
                    sh """
                        export BUILD_NUMBER=${env.BUILD_NUMBER}
                        export GIT_COMMIT=${env.GIT_COMMIT}
                        docker-compose -f docker-compose.prod.yml up -d --no-deps server
                        sleep 10
                        docker-compose -f docker-compose.prod.yml up -d --no-deps client
                        echo "✅ Production deployment completed"
                    """
                }
            }
        }
        
        stage('Health Check') {
            when {
                anyOf {
                    branch 'main'
                    branch 'develop'
                }
            }
            steps {
                script {
                    echo "🏥 Running post-deployment health checks..."
                    sleep(20) // Wait for services to start
                    
                    // Determine the correct port based on environment
                    def healthUrl = ""
                    if (env.BRANCH_NAME == 'develop') {
                        healthUrl = "http://localhost:5001/api/health"
                    } else if (env.BRANCH_NAME == 'main') {
                        healthUrl = "http://localhost/api/health"
                    } else {
                        healthUrl = "http://localhost:5000/api/health"
                    }
                    
                    sh """
                        echo "Checking health at: ${healthUrl}"
                        for i in {1..5}; do
                            if curl -f ${healthUrl}; then
                                echo "✅ Health check passed on attempt \$i"
                                break
                            else
                                echo "⏳ Health check failed, attempt \$i/5, waiting..."
                                sleep 10
                                if [ \$i -eq 5 ]; then
                                    echo "❌ Health check failed after 5 attempts"
                                    exit 1
                                fi
                            fi
                        done
                    """
                }
            }
        }
    }
    
    post {
        always {
            echo "🧹 Cleaning up workspace..."
            cleanWs()
        }
        success {
            echo "✅ Pipeline completed successfully!"
            script {
                if (env.BRANCH_NAME == 'main') {
                    try {
                        slackSend(
                            color: 'good',
                            message: "✅ Production deployment successful! Build #${env.BUILD_NUMBER}"
                        )
                    } catch (Exception e) {
                        echo "⚠️ Slack notification failed: ${e.getMessage()}"
                    }
                }
            }
        }
        failure {
            echo "❌ Pipeline failed!"
            script {
                try {
                    slackSend(
                        color: 'danger',
                        message: "❌ Build failed! Build #${env.BUILD_NUMBER} - ${env.BUILD_URL}"
                    )
                } catch (Exception e) {
                    echo "⚠️ Slack notification failed: ${e.getMessage()}"
                }
            }
        }
        unstable {
            echo "⚠️ Pipeline unstable - some tests may have failed"
        }
    }
}