# Jenkins Learning with MERN Stack

This project is designed to teach Jenkins CI/CD from scratch using a simple MERN stack application.

## Project Structure

```
jenkins_practice_1/
├── client/                 # React frontend
├── server/                 # Node.js/Express backend
├── docs/                   # Jenkins learning documentation
├── docker/                 # Docker configurations
├── Jenkinsfile            # Jenkins pipeline configuration
├── docker-compose.yml     # Local development setup
└── README.md             # This file
```

## What You'll Learn

### Jenkins Fundamentals

- Jenkins installation and setup
- Pipeline as Code with Jenkinsfile
- Multi-stage pipelines
- Build automation
- Testing integration
- Deployment strategies
- Environment management

### DevOps Practices

- Containerization with Docker
- CI/CD pipeline design
- Automated testing
- Code quality gates
- Deployment automation
- Monitoring and logging

## Getting Started

1. **Prerequisites**

   - Node.js (v16 or higher)
   - Docker and Docker Compose
   - Git
   - Jenkins (we'll install this together)

2. **Local Development**

   ```bash
   # Install dependencies
   cd client && npm install
   cd ../server && npm install

   # Start development servers
   docker-compose up -dev
   ```

3. **Jenkins Setup**
   - Follow the documentation in `/docs/jenkins-setup.md`
   - Configure your first pipeline
   - Run automated builds and deployments

## Application Features

Our simple MERN application includes:

- **Frontend (React)**: Todo list with CRUD operations
- **Backend (Express)**: REST API with MongoDB
- **Database (MongoDB)**: Data persistence
- **Testing**: Unit and integration tests
- **Deployment**: Automated with Jenkins

## Learning Path

1. Set up the MERN application locally
2. Understand the codebase and architecture
3. Install and configure Jenkins
4. Create your first pipeline
5. Add testing and quality gates
6. Implement deployment strategies
7. Monitor and optimize your pipeline

## Resources

- [Jenkins Official Documentation](https://www.jenkins.io/doc/)
- [Pipeline Syntax Reference](https://www.jenkins.io/doc/book/pipeline/syntax/)
- [Docker Best Practices](https://docs.docker.com/develop/best-practices/)

Happy learning! 🚀
