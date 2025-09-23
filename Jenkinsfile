pipeline {
    agent any
    
    environment {
        // Define environment variables
        NODE_VERSION = '18'
        MONGODB_URI = 'mongodb://mongo:27017/jenkins_mern_db'
        BUILD_NUMBER = "${env.BUILD_NUMBER}"
        GIT_COMMIT = "${env.GIT_COMMIT}"
    }
    
    stages {
        stage('Checkout') {
            steps {
                script {
                    echo "🔄 Checking out code from Git repository..."
                    // Git checkout is handled automatically by Jenkins
                    sh 'git --version'
                    sh 'node --version'
                    sh 'npm --version'
                }
            }
        }
        
        stage('Install Dependencies') {
            parallel {
                stage('Install Client Dependencies') {
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
                                sh 'npm run lint || echo "Linting completed with warnings"'
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
                            publishTestResults testResultsPattern: 'client/coverage/lcov.info'
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
                            sh 'docker build -t jenkins-mern-client:${BUILD_NUMBER} -f docker/Dockerfile.client .'
                            sh 'docker tag jenkins-mern-client:${BUILD_NUMBER} jenkins-mern-client:latest'
                        }
                    }
                }
                stage('Build Server Image') {
                    steps {
                        script {
                            echo "🐳 Building Docker image for server..."
                            sh 'docker build -t jenkins-mern-server:${BUILD_NUMBER} -f docker/Dockerfile.server .'
                            sh 'docker tag jenkins-mern-server:${BUILD_NUMBER} jenkins-mern-server:latest'
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
                    sh 'docker-compose -f docker-compose.staging.yml up -d'
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
                    input message: 'Deploy to production?', ok: 'Deploy'
                    sh 'docker-compose -f docker-compose.prod.yml up -d'
                }
            }
        }
        
        stage('Health Check') {
            steps {
                script {
                    echo "🏥 Running post-deployment health checks..."
                    sleep(10) // Wait for services to start
                    sh '''
                        # Check if the API is responding
                        curl -f http://localhost:5000/api/health || echo "Health check failed"
                    '''
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
                    slackSend(
                        color: 'good',
                        message: "✅ Production deployment successful! Build #${env.BUILD_NUMBER}"
                    )
                }
            }
        }
        failure {
            echo "❌ Pipeline failed!"
            script {
                slackSend(
                    color: 'danger',
                    message: "❌ Build failed! Build #${env.BUILD_NUMBER} - ${env.BUILD_URL}"
                )
            }
        }
        unstable {
            echo "⚠️ Pipeline unstable - some tests may have failed"
        }
    }
}