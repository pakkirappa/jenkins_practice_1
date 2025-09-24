# Node.js Installation Guide for Jenkins

This guide covers different methods to ensure Node.js is available in your Jenkins pipeline.

## Method 1: Jenkins NodeJS Plugin (Recommended)

This is the cleanest and most reliable approach for Jenkins.

### 1. Install NodeJS Plugin

1. Go to **Manage Jenkins** → **Manage Plugins**
2. Go to **Available** tab
3. Search for "NodeJS"
4. Install **NodeJS Plugin** by Nikita Skopintsev
5. Restart Jenkins

### 2. Configure NodeJS Tool

1. Go to **Manage Jenkins** → **Global Tool Configuration**
2. Scroll down to **NodeJS** section
3. Click **Add NodeJS**
4. Configure:
   - **Name**: `NodeJS-18` (this name is used in Jenkinsfile)
   - **Version**: Select Node.js 18.x.x
   - **Global npm packages**: Add any global packages you need
5. Click **Save**

### 3. Use in Pipeline

```groovy
pipeline {
    agent any

    tools {
        nodejs 'NodeJS-18'  // Must match the name in Global Tool Configuration
    }

    stages {
        stage('Build') {
            steps {
                sh 'node --version'
                sh 'npm --version'
                sh 'npm install'
            }
        }
    }
}
```

## Method 2: Docker Agent (Alternative)

Use a Docker container with Node.js pre-installed.

```groovy
pipeline {
    agent {
        docker {
            image 'node:18-alpine'
            // Mount Docker socket for building images
            args '-v /var/run/docker.sock:/var/run/docker.sock'
        }
    }

    stages {
        stage('Build') {
            steps {
                sh 'node --version'
                sh 'npm install'
            }
        }
    }
}
```

## Method 3: Manual Installation Script (Fallback)

If Jenkins plugins are not available, use the installation script in the pipeline.

### For Linux/Ubuntu:

```bash
#!/bin/bash
# Install Node.js 18 on Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version
npm --version
```

### For Windows:

```powershell
# Using Chocolatey (if available)
if (Get-Command choco -ErrorAction SilentlyContinue) {
    choco install nodejs --version=18.17.0 -y
} else {
    Write-Host "Please install Node.js manually from https://nodejs.org/"
}
```

### For macOS:

```bash
# Using Homebrew
if command -v brew >/dev/null 2>&1; then
    brew install node@18
else
    # Using nvm
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
    source ~/.bashrc
    nvm install 18
    nvm use 18
fi
```

## Method 4: Pre-installed on Jenkins Agent

### For Docker-based Jenkins:

Create a custom Jenkins image with Node.js pre-installed:

```dockerfile
FROM jenkins/jenkins:lts

# Switch to root to install Node.js
USER root

# Install Node.js
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get install -y nodejs

# Install Docker CLI for building images
RUN apt-get update && \
    apt-get install -y docker.io

# Switch back to jenkins user
USER jenkins
```

Build and run:

```bash
docker build -t jenkins-with-nodejs .
docker run -p 8080:8080 -v jenkins_home:/var/jenkins_home jenkins-with-nodejs
```

## Troubleshooting

### Permission Issues

If you get permission errors with npm:

```bash
# Set npm cache directory
npm config set cache ~/.npm-cache --global

# Or in pipeline
export NPM_CONFIG_CACHE="${WORKSPACE}/.npm-cache"
```

### Path Issues

If Node.js is installed but not found:

```bash
# Add to PATH
export PATH="/usr/local/bin:$PATH"

# Or specify full path
/usr/local/bin/node --version
```

### Windows Specific

For Windows agents, ensure PowerShell execution policy allows scripts:

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

## Verification Script

Create this script to verify Node.js availability:

```bash
#!/bin/bash
echo "🔍 Checking Node.js installation..."

if command -v node >/dev/null 2>&1; then
    echo "✅ Node.js found: $(node --version)"
else
    echo "❌ Node.js not found"
    exit 1
fi

if command -v npm >/dev/null 2>&1; then
    echo "✅ npm found: $(npm --version)"
else
    echo "❌ npm not found"
    exit 1
fi

echo "🎉 Node.js environment is ready!"
```

## Best Practices

1. **Use Jenkins NodeJS Plugin**: Most reliable and maintainable
2. **Docker Agents**: Good for consistent environments
3. **Version Pinning**: Always specify Node.js version
4. **Cache npm packages**: Use workspace cache to speed up builds
5. **Error Handling**: Always verify installation before proceeding

## Example: Complete Pipeline with Node.js Setup

```groovy
pipeline {
    agent any

    tools {
        nodejs 'NodeJS-18'
    }

    environment {
        NPM_CONFIG_CACHE = "${WORKSPACE}/.npm-cache"
    }

    stages {
        stage('Verify Environment') {
            steps {
                sh '''
                    echo "Node.js version: $(node --version)"
                    echo "npm version: $(npm --version)"
                    echo "Workspace: ${WORKSPACE}"
                '''
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'npm ci'
            }
        }

        stage('Build') {
            steps {
                sh 'npm run build'
            }
        }
    }
}
```

Choose the method that best fits your Jenkins setup and infrastructure!
