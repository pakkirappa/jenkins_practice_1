# Getting Started Guide

Welcome to your Jenkins learning journey! This guide will help you get your MERN stack application up and running with Jenkins CI/CD.

## Quick Start (5 minutes)

### 1. Clone and Setup

```bash
git clone <your-repo-url>
cd jenkins_practice_1

# Copy environment file
cp server/.env.example server/.env
```

### 2. Start the Application

```bash
# Start all services with Docker
docker-compose up -d

# Or start individual services for development
cd server && npm install && npm run dev
cd ../client && npm install && npm start
```

### 3. Verify Everything Works

- **Application**: http://localhost:3000
- **API Health**: http://localhost:5000/api/health
- **Jenkins**: http://localhost:8080

## Learning Path

### Week 1: Foundations

- [ ] Set up the MERN application locally
- [ ] Understand the codebase structure
- [ ] Read Jenkins concepts documentation
- [ ] Install Jenkins and create your first job

### Week 2: Basic Pipelines

- [ ] Create a simple pipeline
- [ ] Add build and test stages
- [ ] Understand pipeline syntax
- [ ] Implement basic error handling

### Week 3: Advanced Features

- [ ] Add Docker integration
- [ ] Implement parallel stages
- [ ] Set up different environments
- [ ] Add approval gates

### Week 4: Production Ready

- [ ] Security and credentials
- [ ] Monitoring and notifications
- [ ] Performance optimization
- [ ] Documentation and best practices

## Project Structure

```
jenkins_practice_1/
├── client/                 # React Frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   └── App.js         # Main application
│   ├── package.json
│   └── Dockerfile
│
├── server/                # Node.js Backend
│   ├── models/           # MongoDB models
│   ├── routes/           # API routes
│   ├── __tests__/        # Backend tests
│   ├── server.js         # Express server
│   └── package.json
│
├── docker/               # Docker configurations
│   ├── Dockerfile.client
│   ├── Dockerfile.server
│   └── nginx.conf
│
├── docs/                 # Documentation
│   ├── jenkins-setup.md
│   ├── jenkins-concepts.md
│   └── getting-started.md (this file)
│
├── Jenkinsfile          # CI/CD Pipeline
├── docker-compose.yml   # Local development
└── README.md           # Project overview
```

## Key Commands

### Development

```bash
# Start development servers
npm run dev:server    # Backend with nodemon
npm run dev:client    # React development server

# Run tests
npm test              # Client tests
npm run test:server   # Server tests

# Build for production
npm run build         # Client build
```

### Docker

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Rebuild images
docker-compose build
```

### Jenkins

```bash
# Get initial admin password
docker exec jenkins-server-ci cat /var/jenkins_home/secrets/initialAdminPassword

# View Jenkins logs
docker logs jenkins-server-ci
```

## What You'll Build

By the end of this tutorial, you'll have:

### A Complete MERN Application

- **Frontend**: React todo app with modern UI
- **Backend**: Express API with MongoDB
- **Database**: MongoDB with sample data
- **Tests**: Comprehensive test suites

### A Production-Ready CI/CD Pipeline

- **Automated Builds**: Triggered on code changes
- **Testing**: Unit, integration, and e2e tests
- **Quality Gates**: Code linting and security scanning
- **Multi-Environment**: Dev, staging, production
- **Deployment**: Automated Docker deployments
- **Monitoring**: Health checks and notifications

## Common Tasks

### Adding a New Feature

1. Create a feature branch
2. Make your changes
3. Add tests
4. Commit and push
5. Watch Jenkins build and test automatically
6. Create pull request
7. Merge and deploy

### Debugging Build Issues

1. Check Jenkins console output
2. Review pipeline stage failures
3. Test locally with same commands
4. Check environment variables
5. Verify Docker configurations

### Updating Dependencies

1. Update package.json files
2. Test locally
3. Update Docker base images if needed
4. Verify pipeline still works
5. Update documentation

## Helpful Resources

### Documentation

- [Jenkins Setup Guide](jenkins-setup.md)
- [Jenkins Concepts](jenkins-concepts.md)
- [Project README](../README.md)

### External Links

- [Jenkins Documentation](https://www.jenkins.io/doc/)
- [Docker Compose Reference](https://docs.docker.com/compose/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Jest Documentation](https://jestjs.io/docs/getting-started)

### Community

- [Jenkins Community Forums](https://community.jenkins.io/)
- [Stack Overflow - Jenkins](https://stackoverflow.com/questions/tagged/jenkins)
- [Docker Community](https://www.docker.com/community)

## Troubleshooting

### Port Conflicts

If ports 3000, 5000, 8080, or 27017 are already in use:

```bash
# Find processes using ports
netstat -ano | findstr :3000
netstat -ano | findstr :5000

# Kill processes (Windows)
taskkill /PID <process-id> /F

# Or change ports in docker-compose.yml
```

### Docker Issues

```bash
# Clean up Docker resources
docker system prune -a

# Rebuild containers
docker-compose build --no-cache

# Reset Docker (if needed)
docker system reset
```

### Jenkins Access Issues

```bash
# Check Jenkins container status
docker ps | grep jenkins

# Restart Jenkins
docker-compose restart jenkins

# Check Jenkins logs
docker logs jenkins-server-ci
```

### MongoDB Connection Issues

```bash
# Check MongoDB status
docker ps | grep mongo

# Connect to MongoDB shell
docker exec -it jenkins-mongo mongosh

# Check database contents
use jenkins_mern_db
db.todos.find()
```

## Next Steps

After completing this tutorial:

1. **Expand the Application**

   - Add user authentication
   - Implement real-time features
   - Add more complex business logic

2. **Advanced Jenkins Features**

   - Multi-branch pipelines
   - Pipeline libraries
   - Blue Ocean interface
   - Jenkins X for Kubernetes

3. **Cloud Deployment**

   - Deploy to AWS/Azure/GCP
   - Use managed services
   - Implement infrastructure as code

4. **Monitoring and Observability**
   - Application performance monitoring
   - Log aggregation
   - Metrics and alerting

## Support

If you run into issues:

1. Check the troubleshooting section above
2. Review the detailed documentation
3. Search for similar issues online
4. Create an issue in the project repository

Happy learning! 🚀
