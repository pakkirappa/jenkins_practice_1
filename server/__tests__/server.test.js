const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');

// Test database
const MONGODB_TEST_URI = process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/jenkins_mern_test_db';

describe('Server API Tests', () => {
  beforeAll(async () => {
    // Connect to test database
    await mongoose.connect(MONGODB_TEST_URI);
  });

  afterAll(async () => {
    // Clean up and close connection
    await mongoose.connection.db.dropDatabase();
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // Clear the database before each test
    await mongoose.connection.db.dropDatabase();
  });

  describe('GET /', () => {
    it('should return API information', async () => {
      const res = await request(app).get('/');
      
      expect(res.status).toBe(200);
      expect(res.body.message).toBe('🚀 Jenkins MERN Learning API');
      expect(res.body.version).toBe('1.0.0');
    });
  });

  describe('GET /api/health', () => {
    it('should return health status', async () => {
      const res = await request(app).get('/api/health');
      
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('healthy');
      expect(res.body.database.status).toBe('connected');
    });
  });

  describe('GET /api/health/detailed', () => {
    it('should return detailed health information', async () => {
      const res = await request(app).get('/api/health/detailed');
      
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('healthy');
      expect(res.body.services.api).toBe('operational');
      expect(res.body.system).toBeDefined();
    });
  });

  describe('404 Handler', () => {
    it('should return 404 for non-existent routes', async () => {
      const res = await request(app).get('/non-existent-route');
      
      expect(res.status).toBe(404);
      expect(res.body.message).toBe('Route not found');
    });
  });
});