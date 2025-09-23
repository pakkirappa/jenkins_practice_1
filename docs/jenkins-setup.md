# Jenkins Setup Guide for MERN Stack Application

This guide will walk you through setting up Jenkins locally and creating your first CI/CD pipeline for a MERN stack application.

## Table of Contents

1. [Jenkins Installation](#jenkins-installation)
2. [Initial Configuration](#initial-configuration)
3. [Creating Your First Pipeline](#creating-your-first-pipeline)
4. [Understanding the Pipeline](#understanding-the-pipeline)
5. [Troubleshooting](#troubleshooting)

## Jenkins Installation

### Option 1: Using Docker (Recommended)

1. **Start Jenkins with Docker Compose**

   ```bash
   docker-compose up jenkins
   ```

2. **Access Jenkins**

   - Open your browser and go to `http://localhost:8080`
   - You should see the Jenkins setup wizard

3. **Get the Initial Admin Password**
   ```bash
   docker exec jenkins-server-ci cat /var/jenkins_home/secrets/initialAdminPassword
   ```

### Option 2: Manual Installation

1. **Download Jenkins**

   - Go to [jenkins.io](https://www.jenkins.io/download/)
   - Download the appropriate installer for your OS

2. **Install Java (if not installed)**

   ```bash
   # Windows (using Chocolatey)
   choco install openjdk11

   # macOS (using Homebrew)
   brew install openjdk@11

   # Ubuntu/Debian
   sudo apt update
   sudo apt install openjdk-11-jdk
   ```

3. **Start Jenkins**
   ```bash
   java -jar jenkins.war --httpPort=8080
   ```

## Initial Configuration

### 1. Unlock Jenkins

- Use the admin password from the previous step
- Click "Continue"

### 2. Install Suggested Plugins

- Click "Install suggested plugins"
- Wait for the installation to complete

### 3. Create Admin User

- Fill in the admin user details
- Click "Save and Continue"

### 4. Configure Instance

- Set Jenkins URL (usually `http://localhost:8080/`)
- Click "Save and Finish"

### 5. Install Required Plugins

Go to **Manage Jenkins** → **Manage Plugins** → **Available** and install:

- **Pipeline**: For pipeline as code support
- **Git**: For Git repository integration
- **Docker Pipeline**: For Docker support
- **NodeJS**: For Node.js builds
- **Blue Ocean**: For modern pipeline UI
- **Slack Notification**: For notifications (optional)

## Creating Your First Pipeline

### 1. Create a New Pipeline Job

1. Click "New Item" from Jenkins dashboard
2. Enter item name: `jenkins-mern-pipeline`
3. Select "Pipeline" and click "OK"

### 2. Configure Pipeline

#### General Settings

- **Description**: "MERN Stack CI/CD Pipeline for Learning"
- Check "GitHub project" and enter your repository URL

#### Pipeline Configuration

- **Definition**: Pipeline script from SCM
- **SCM**: Git
- **Repository URL**: Your Git repository URL
- **Branch**: `*/main` (or your default branch)
- **Script Path**: `Jenkinsfile`

### 3. Save and Run

- Click "Save"
- Click "Build Now" to trigger your first build

## Understanding the Pipeline

Our Jenkinsfile contains several stages that demonstrate key Jenkins concepts:

### 1. Environment Variables

```groovy
environment {
    NODE_VERSION = '18'
    MONGODB_URI = 'mongodb://mongo:27017/jenkins_mern_db'
    BUILD_NUMBER = "${env.BUILD_NUMBER}"
}
```

- Global variables available to all pipeline stages
- Can include sensitive data (use credentials)

### 2. Parallel Stages

```groovy
parallel {
    stage('Install Client Dependencies') { ... }
    stage('Install Server Dependencies') { ... }
}
```

- Runs stages simultaneously to save time
- Great for independent tasks like testing multiple components

### 3. Conditional Execution

```groovy
when {
    anyOf {
        branch 'main'
        branch 'develop'
    }
}
```

- Execute stages only under certain conditions
- Common conditions: branch, environment, expression

### 4. Post Actions

```groovy
post {
    always { cleanWs() }
    success { echo "✅ Pipeline completed successfully!" }
    failure { echo "❌ Pipeline failed!" }
}
```

- Actions that run after pipeline completion
- Useful for cleanup, notifications, and reporting

## Pipeline Stages Explained

### 1. **Checkout**

- Automatically handled by Jenkins
- Downloads your source code from Git

### 2. **Install Dependencies**

- Installs Node.js packages for both client and server
- Uses `npm ci` for faster, reliable installs

### 3. **Lint and Code Quality**

- Runs ESLint to check code style
- Performs security audits
- Can fail the build if quality standards aren't met

### 4. **Build**

- Compiles React application for production
- Creates optimized bundles
- Archives build artifacts

### 5. **Test**

- Runs unit tests for React components
- Runs API tests for Node.js server
- Generates test coverage reports

### 6. **Docker Build**

- Creates Docker images for deployment
- Tags images with build numbers
- Only runs on main/develop branches

### 7. **Integration Tests**

- Tests the complete application stack
- Uses Docker Compose to spin up services
- Validates end-to-end functionality

### 8. **Deploy**

- Deploys to staging (develop branch)
- Deploys to production (main branch)
- Includes approval gates for production

### 9. **Health Check**

- Validates deployed application is healthy
- Checks API endpoints
- Can trigger rollback if unhealthy

## Best Practices

### 1. Pipeline as Code

- Store Jenkinsfile in your repository
- Version control your CI/CD configuration
- Enable peer review of pipeline changes

### 2. Environment Isolation

- Use different environments for different branches
- Isolate test data and configurations
- Clean up resources after tests

### 3. Fail Fast

- Run quick tests first (linting, unit tests)
- Stop pipeline early if fundamental issues exist
- Save time and resources

### 4. Artifact Management

- Archive build artifacts
- Store test results and coverage reports
- Keep artifacts for debugging and rollbacks

### 5. Security

- Use Jenkins credentials for sensitive data
- Don't hardcode passwords or API keys
- Regularly update plugins and Jenkins

## Monitoring and Notifications

### 1. Build Status

- Monitor build success/failure rates
- Set up dashboards for visibility
- Track build duration trends

### 2. Slack Integration

```groovy
post {
    success {
        slackSend(
            color: 'good',
            message: "✅ Build successful! ${env.BUILD_URL}"
        )
    }
}
```

### 3. Email Notifications

- Configure SMTP settings
- Send notifications on failures
- Include build logs and error details

## Next Steps

1. **Advanced Pipeline Features**

   - Multi-branch pipelines
   - Shared libraries
   - Pipeline templates

2. **Deployment Strategies**

   - Blue-green deployments
   - Canary releases
   - Rolling updates

3. **Monitoring and Observability**

   - Application monitoring
   - Log aggregation
   - Performance metrics

4. **Security and Compliance**
   - Code scanning
   - Dependency vulnerability checks
   - Compliance reporting

## Troubleshooting Common Issues

### Build Fails with "node: command not found"

- Install NodeJS plugin
- Configure Node.js tool in Global Tool Configuration
- Add Node.js installation in pipeline

### Docker Commands Fail

- Ensure Jenkins user has Docker permissions
- Install Docker Pipeline plugin
- Check Docker daemon is running

### Tests Timeout or Fail

- Increase test timeout values
- Check database connectivity
- Review test environment configuration

### Pipeline Stuck at Input Step

- Check Jenkins UI for approval prompts
- Configure appropriate permissions
- Set timeout for input steps

Remember: Learning Jenkins is a journey! Start with simple pipelines and gradually add more complex features as you become comfortable with the basics.
