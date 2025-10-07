// Alternative Jenkinsfile using Docker agents - no Node.js installation required
pipeline {
    agent none // We'll specify agents per stage
    
    environment {
        MONGODB_URI = 'mongodb://mongo:27017/jenkins_mern_db'
        DOCKER_REGISTRY = 'jenkins-mern'
        APP_NAME = 'jenkins-mern-app'
    }
    
    stages {
        stage('Checkout & Environment Check') {
            agent any
            steps {
                script {
                    echo "🔄 Checking out code and verifying Docker..."
                    
                    // Check if running on Windows or Linux
                    if (isUnix()) {
                        sh 'git --version'
                        sh 'docker --version'
                    } else {
                        bat 'git --version'
                        bat 'docker --version'
                    }
                    
                    echo "✅ Basic environment ready"
                }
            }
        }
        
        stage('Install Dependencies') {
            parallel {
                stage('Install Client Dependencies') {
                    agent {
                        docker {
                            image 'node:18-alpine'
                            args '-v ${WORKSPACE}:/workspace -w /workspace'
                        }
                    }
                    steps {
                        script {
                            echo "📦 Installing React client dependencies..."
                            dir('client') {
                                sh 'npm ci'
                            }
                        }
                    }
                }
                stage('Install Server Dependencies') {
                    agent {
                        docker {
                            image 'node:18-alpine'
                            args '-v ${WORKSPACE}:/workspace -w /workspace'
                        }
                    }
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
                    agent {
                        docker {
                            image 'node:18-alpine'
                            args '-v ${WORKSPACE}:/workspace -w /workspace'
                        }
                    }
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
                    agent {
                        docker {
                            image 'node:18-alpine'
                            args '-v ${WORKSPACE}:/workspace -w /workspace'
                        }
                    }
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
                    agent {
                        docker {
                            image 'node:18-alpine'
                            args '-v ${WORKSPACE}:/workspace -w /workspace'
                        }
                    }
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
                    agent {
                        docker {
                            image 'node:18-alpine'
                            args '-v ${WORKSPACE}:/workspace -w /workspace'
                        }
                    }
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
                    agent {
                        docker {
                            image 'node:18-alpine'
                            args '-v ${WORKSPACE}:/workspace -w /workspace'
                        }
                    }
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
                    agent {
                        docker {
                            image 'node:18-alpine'
                            args '-v ${WORKSPACE}:/workspace -w /workspace'
                        }
                    }
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
                            publishHTML([
                                allowMissing: false,
                                alwaysLinkToLastBuild: true,
                                keepAll: true,
                                reportDir: 'server/coverage',
                                reportFiles: 'index.html',
                                reportName: 'Server Test Coverage'
                            ])
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
                    agent any
                    steps {
                        script {
                            echo "🐳 Building Docker image for client..."
                            
                            if (isUnix()) {
                                sh """
                                    docker build -t ${DOCKER_REGISTRY}-client:${env.BUILD_NUMBER} -f docker/Dockerfile.client .
                                    docker tag ${DOCKER_REGISTRY}-client:${env.BUILD_NUMBER} ${DOCKER_REGISTRY}-client:latest
                                    echo "✅ Client Docker image built: ${DOCKER_REGISTRY}-client:${env.BUILD_NUMBER}"
                                """
                            } else {
                                bat """
                                    docker build -t ${DOCKER_REGISTRY}-client:${env.BUILD_NUMBER} -f docker/Dockerfile.client .
                                    docker tag ${DOCKER_REGISTRY}-client:${env.BUILD_NUMBER} ${DOCKER_REGISTRY}-client:latest
                                    echo "✅ Client Docker image built: ${DOCKER_REGISTRY}-client:${env.BUILD_NUMBER}"
                                """
                            }
                        }
                    }
                }
                stage('Build Server Image') {
                    agent any
                    steps {
                        script {
                            echo "🐳 Building Docker image for server..."
                            
                            if (isUnix()) {
                                sh """
                                    docker build -t ${DOCKER_REGISTRY}-server:${env.BUILD_NUMBER} -f docker/Dockerfile.server .
                                    docker tag ${DOCKER_REGISTRY}-server:${env.BUILD_NUMBER} ${DOCKER_REGISTRY}-server:latest
                                    echo "✅ Server Docker image built: ${DOCKER_REGISTRY}-server:${env.BUILD_NUMBER}"
                                """
                            } else {
                                bat """
                                    docker build -t ${DOCKER_REGISTRY}-server:${env.BUILD_NUMBER} -f docker/Dockerfile.server .
                                    docker tag ${DOCKER_REGISTRY}-server:${env.BUILD_NUMBER} ${DOCKER_REGISTRY}-server:latest
                                    echo "✅ Server Docker image built: ${DOCKER_REGISTRY}-server:${env.BUILD_NUMBER}"
                                """
                            }
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
            agent any
            steps {
                script {
                    echo "🔗 Running integration tests..."
                    
                    if (isUnix()) {
                        sh 'docker-compose -f docker-compose.test.yml up --build --abort-on-container-exit'
                    } else {
                        bat 'docker-compose -f docker-compose.test.yml up --build --abort-on-container-exit'
                    }
                }
            }
            post {
                always {
                    script {
                        if (isUnix()) {
                            sh 'docker-compose -f docker-compose.test.yml down'
                        } else {
                            bat 'docker-compose -f docker-compose.test.yml down'
                        }
                    }
                }
            }
            }
        }
        
        stage('Deploy to Staging') {
            when {
                branch 'develop'
            }
            agent any
            steps {
                script {
                    echo "🚀 Deploying to staging environment..."
                    
                    if (isUnix()) {
                        sh """
                            export BUILD_NUMBER=${env.BUILD_NUMBER}
                            export GIT_COMMIT=${env.GIT_COMMIT}
                            docker-compose -f docker-compose.staging.yml down || true
                            docker-compose -f docker-compose.staging.yml up -d
                            echo "✅ Staging deployment completed"
                        """
                    } else {
                        bat """
                            set BUILD_NUMBER=${env.BUILD_NUMBER}
                            set GIT_COMMIT=${env.GIT_COMMIT}
                            docker-compose -f docker-compose.staging.yml down
                            docker-compose -f docker-compose.staging.yml up -d
                            echo "✅ Staging deployment completed"
                        """
                    }
                }
            }
        }
        
        stage('Deploy to Production') {
            when {
                branch 'main'
            }
            agent any
            steps {
                script {
                    echo "🌟 Deploying to production environment..."
                    timeout(time: 5, unit: 'MINUTES') {
                        input message: 'Deploy to production?', ok: 'Deploy',
                              submitterParameter: 'DEPLOYER'
                    }
                    echo "Deployment approved by: ${env.DEPLOYER}"
                    
                    if (isUnix()) {
                        sh """
                            export BUILD_NUMBER=${env.BUILD_NUMBER}
                            export GIT_COMMIT=${env.GIT_COMMIT}
                            docker-compose -f docker-compose.prod.yml up -d --no-deps server
                            sleep 10
                            docker-compose -f docker-compose.prod.yml up -d --no-deps client
                            echo "✅ Production deployment completed"
                        """
                    } else {
                        bat """
                            set BUILD_NUMBER=${env.BUILD_NUMBER}
                            set GIT_COMMIT=${env.GIT_COMMIT}
                            docker-compose -f docker-compose.prod.yml up -d --no-deps server
                            timeout /t 10
                            docker-compose -f docker-compose.prod.yml up -d --no-deps client
                            echo "✅ Production deployment completed"
                        """
                    }
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
            agent any
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
                    
                    if (isUnix()) {
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
                    } else {
                        bat """
                            echo "Checking health at: ${healthUrl}"
                            for /L %%i in (1,1,5) do (
                                curl -f ${healthUrl} && (
                                    echo "✅ Health check passed on attempt %%i"
                                    goto :end
                                ) || (
                                    echo "⏳ Health check failed, attempt %%i/5, waiting..."
                                    timeout /t 10 >nul
                                    if %%i==5 (
                                        echo "❌ Health check failed after 5 attempts"
                                        exit /b 1
                                    )
                                )
                            )
                            :end
                        """
                    }
                }
            }
        }
    }
    
    post {
        always {
            node('') {
                echo "🧹 Cleaning up workspace..."
                cleanWs()
            }
        }
        success {
            node('') {
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
        }
        failure {
            node('') {
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
        }
        unstable {
            node('') {
                echo "⚠️ Pipeline unstable - some tests may have failed"
            }
        }
    }
}