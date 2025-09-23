# Jenkins Concepts and Terminology

This document explains key Jenkins concepts that every developer should understand when working with CI/CD pipelines.

## Core Concepts

### 1. Job vs Pipeline

- **Job**: Traditional Jenkins build configuration through UI
- **Pipeline**: Code-based approach using Jenkinsfile (preferred)

### 2. Agent

- **Definition**: Computing resource where Jenkins executes work
- **Types**:
  - `any`: Run on any available agent
  - `none`: No agent allocated to pipeline (stages must specify their own)
  - `label`: Run on agents with specific labels
  - `docker`: Run inside a Docker container

### 3. Stages and Steps

- **Stage**: Logical division of pipeline work (Build, Test, Deploy)
- **Step**: Individual task within a stage (shell command, plugin action)

### 4. Workspace

- **Definition**: Directory where Jenkins checks out code and runs builds
- **Lifecycle**: Created per build, cleaned after completion
- **Access**: Available to all steps in the pipeline

## Pipeline Types

### 1. Declarative Pipeline (Recommended)

```groovy
pipeline {
    agent any
    stages {
        stage('Build') {
            steps {
                echo 'Building...'
            }
        }
    }
}
```

- Structured syntax
- Built-in error handling
- Better for beginners

### 2. Scripted Pipeline

```groovy
node {
    stage('Build') {
        echo 'Building...'
    }
}
```

- More flexible but complex
- Groovy-based scripting
- Advanced use cases

## Pipeline Syntax Elements

### Environment Variables

```groovy
environment {
    // Pipeline-level variables
    APP_NAME = 'jenkins-mern-app'

    // Stage-level variables (within stage block)
    STAGE_VAR = 'value'
}
```

### Parameters

```groovy
parameters {
    string(name: 'BRANCH', defaultValue: 'main', description: 'Branch to build')
    booleanParam(name: 'SKIP_TESTS', defaultValue: false, description: 'Skip tests')
    choice(name: 'ENVIRONMENT', choices: ['dev', 'staging', 'prod'], description: 'Target environment')
}
```

### Triggers

```groovy
triggers {
    // Poll SCM every 5 minutes
    pollSCM('H/5 * * * *')

    // CRON-like scheduling
    cron('H 2 * * 1-5')

    // Trigger on upstream job completion
    upstream(upstreamProjects: 'upstream-job', threshold: hudson.model.Result.SUCCESS)
}
```

### Conditions

```groovy
when {
    branch 'main'                    // Specific branch
    environment name: 'DEPLOY', value: 'true'  // Environment variable
    expression { env.BUILD_NUMBER.toInteger() > 100 }  // Custom expression
    anyOf {                          // Multiple conditions (OR)
        branch 'main'
        branch 'develop'
    }
    allOf {                          // Multiple conditions (AND)
        branch 'main'
        environment name: 'PROD_READY', value: 'true'
    }
}
```

## Advanced Features

### Parallel Execution

```groovy
parallel {
    stage('Unit Tests') {
        steps { sh 'npm test' }
    }
    stage('Integration Tests') {
        steps { sh 'npm run test:integration' }
    }
    stage('Security Scan') {
        steps { sh 'npm audit' }
    }
}
```

### Matrix Builds

```groovy
matrix {
    axes {
        axis {
            name 'NODE_VERSION'
            values '14', '16', '18'
        }
        axis {
            name 'OS'
            values 'linux', 'windows', 'mac'
        }
    }
    stages {
        stage('Test') {
            steps {
                sh 'node --version'
                sh 'npm test'
            }
        }
    }
}
```

### Retry and Timeout

```groovy
stage('Deploy') {
    steps {
        retry(3) {
            timeout(time: 5, unit: 'MINUTES') {
                sh 'kubectl apply -f deployment.yaml'
            }
        }
    }
}
```

## Build Artifacts and Reports

### Archive Artifacts

```groovy
post {
    always {
        archiveArtifacts artifacts: 'dist/**/*', fingerprint: true
    }
}
```

### Test Results

```groovy
post {
    always {
        publishTestResults testResultsPattern: 'test-results.xml'
        publishHTML([
            allowMissing: false,
            alwaysLinkToLastBuild: true,
            keepAll: true,
            reportDir: 'coverage',
            reportFiles: 'index.html',
            reportName: 'Coverage Report'
        ])
    }
}
```

## Credentials Management

### Using Credentials

```groovy
environment {
    // String credential
    API_KEY = credentials('api-key-id')

    // Username/password credential
    DOCKER_CREDS = credentials('docker-hub-credentials')
}

steps {
    // Access username and password separately
    sh 'docker login -u $DOCKER_CREDS_USR -p $DOCKER_CREDS_PSW'
}
```

### Credential Types

- **Secret text**: API keys, tokens
- **Username with password**: Login credentials
- **SSH Username with private key**: Git/SSH access
- **Certificate**: SSL certificates
- **Docker Host Certificate Authentication**: Docker daemon access

## Pipeline Libraries

### Shared Libraries

```groovy
@Library('my-shared-library') _

pipeline {
    agent any
    stages {
        stage('Deploy') {
            steps {
                // Use shared library function
                deployToKubernetes(
                    namespace: 'production',
                    image: 'my-app:latest'
                )
            }
        }
    }
}
```

### Benefits

- Code reuse across pipelines
- Centralized maintenance
- Consistent deployment patterns

## Multi-branch Pipelines

### Automatic Pipeline Creation

- Creates pipeline for each branch
- Discovers branches with Jenkinsfile
- Builds on branch changes

### Branch-specific Behavior

```groovy
pipeline {
    agent any
    stages {
        stage('Build') {
            steps {
                script {
                    if (env.BRANCH_NAME == 'main') {
                        echo 'Building for production'
                    } else {
                        echo 'Building for development'
                    }
                }
            }
        }
    }
}
```

## Best Practices

### 1. Pipeline Structure

- Keep stages focused and single-purpose
- Use meaningful stage names
- Group related steps together

### 2. Error Handling

```groovy
stage('Test') {
    steps {
        catchError(buildResult: 'UNSTABLE', stageResult: 'FAILURE') {
            sh 'npm test'
        }
    }
}
```

### 3. Resource Management

```groovy
pipeline {
    agent none
    stages {
        stage('Build') {
            agent { docker 'node:18' }
            steps {
                sh 'npm install'
                sh 'npm run build'
            }
            post {
                always {
                    cleanWs()
                }
            }
        }
    }
}
```

### 4. Security

- Use credentials for sensitive data
- Limit agent access
- Audit pipeline changes
- Regular security updates

### 5. Performance

- Use parallel stages where possible
- Cache dependencies when applicable
- Clean workspaces to free disk space
- Monitor build times and optimize

## Common Patterns

### Feature Branch Workflow

```groovy
pipeline {
    agent any
    stages {
        stage('Feature Branch') {
            when { not { branch 'main' } }
            steps {
                sh 'npm test'
                sh 'npm run lint'
            }
        }
        stage('Main Branch') {
            when { branch 'main' }
            steps {
                sh 'npm test'
                sh 'npm run build'
                sh 'docker build -t my-app .'
                sh 'docker push my-app'
            }
        }
    }
}
```

### Environment Promotion

```groovy
pipeline {
    agent any
    stages {
        stage('Test') {
            steps { sh 'npm test' }
        }
        stage('Deploy to Staging') {
            when { branch 'develop' }
            steps { sh './deploy.sh staging' }
        }
        stage('Deploy to Production') {
            when { branch 'main' }
            steps {
                input message: 'Deploy to production?', ok: 'Deploy'
                sh './deploy.sh production'
            }
        }
    }
}
```

## Troubleshooting Tips

### 1. Debug Information

```groovy
steps {
    script {
        echo "Branch: ${env.BRANCH_NAME}"
        echo "Build Number: ${env.BUILD_NUMBER}"
        echo "Workspace: ${env.WORKSPACE}"
        sh 'env | sort'  // Print all environment variables
    }
}
```

### 2. Script Approval

- Some scripts require administrator approval
- Check Jenkins → Manage Jenkins → In-process Script Approval

### 3. Pipeline Syntax

- Use Pipeline Syntax Generator in Jenkins UI
- Validate Jenkinsfile syntax before committing

This foundation will help you understand and build effective Jenkins pipelines for your MERN stack applications!
