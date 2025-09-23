// Initialize MongoDB with sample data for development
db = db.getSiblingDB('jenkins_mern_db');

// Create a sample user (optional)
db.createUser({
  user: 'app_user',
  pwd: 'app_password',
  roles: [
    {
      role: 'readWrite',
      db: 'jenkins_mern_db'
    }
  ]
});

// Insert sample todos for testing
db.todos.insertMany([
  {
    text: 'Learn Jenkins Pipeline basics',
    completed: false,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    text: 'Set up automated testing in Jenkins',
    completed: false,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    text: 'Configure Docker deployment',
    completed: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    text: 'Implement CI/CD best practices',
    completed: false,
    createdAt: new Date(),
    updatedAt: new Date()
  }
]);

print('✅ Database initialized with sample data!');