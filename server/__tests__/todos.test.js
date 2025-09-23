const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const Todo = require('../models/Todo');

// Test database
const MONGODB_TEST_URI = process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/jenkins_mern_test_db';

describe('Todo API Routes', () => {
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
    // Clear todos collection before each test
    await Todo.deleteMany({});
  });

  describe('GET /api/todos', () => {
    it('should return empty array when no todos exist', async () => {
      const res = await request(app).get('/api/todos');
      
      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
    });

    it('should return all todos', async () => {
      // Create test todos
      await Todo.create([
        { text: 'Learn Jenkins' },
        { text: 'Deploy with Docker' }
      ]);

      const res = await request(app).get('/api/todos');
      
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(2);
      expect(res.body[0].text).toBe('Deploy with Docker'); // Sorted by createdAt desc
      expect(res.body[1].text).toBe('Learn Jenkins');
    });
  });

  describe('POST /api/todos', () => {
    it('should create a new todo', async () => {
      const todoData = { text: 'Learn Jenkins Pipeline' };
      
      const res = await request(app)
        .post('/api/todos')
        .send(todoData);
      
      expect(res.status).toBe(201);
      expect(res.body.text).toBe('Learn Jenkins Pipeline');
      expect(res.body.completed).toBe(false);
      expect(res.body._id).toBeDefined();
    });

    it('should return error for empty text', async () => {
      const res = await request(app)
        .post('/api/todos')
        .send({ text: '' });
      
      expect(res.status).toBe(400);
      expect(res.body.message).toBe('Todo text is required');
    });

    it('should return error for missing text', async () => {
      const res = await request(app)
        .post('/api/todos')
        .send({});
      
      expect(res.status).toBe(400);
      expect(res.body.message).toBe('Todo text is required');
    });
  });

  describe('GET /api/todos/:id', () => {
    it('should return a specific todo', async () => {
      const todo = await Todo.create({ text: 'Learn Jenkins' });
      
      const res = await request(app).get(`/api/todos/${todo._id}`);
      
      expect(res.status).toBe(200);
      expect(res.body.text).toBe('Learn Jenkins');
      expect(res.body._id).toBe(todo._id.toString());
    });

    it('should return 404 for non-existent todo', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      
      const res = await request(app).get(`/api/todos/${nonExistentId}`);
      
      expect(res.status).toBe(404);
      expect(res.body.message).toBe('Todo not found');
    });
  });

  describe('PUT /api/todos/:id', () => {
    it('should update todo text', async () => {
      const todo = await Todo.create({ text: 'Learn Jenkins' });
      
      const res = await request(app)
        .put(`/api/todos/${todo._id}`)
        .send({ text: 'Master Jenkins Pipeline' });
      
      expect(res.status).toBe(200);
      expect(res.body.text).toBe('Master Jenkins Pipeline');
    });

    it('should toggle todo completion status', async () => {
      const todo = await Todo.create({ text: 'Learn Jenkins' });
      
      const res = await request(app)
        .put(`/api/todos/${todo._id}`)
        .send({ completed: true });
      
      expect(res.status).toBe(200);
      expect(res.body.completed).toBe(true);
    });

    it('should return 404 for non-existent todo', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      
      const res = await request(app)
        .put(`/api/todos/${nonExistentId}`)
        .send({ completed: true });
      
      expect(res.status).toBe(404);
      expect(res.body.message).toBe('Todo not found');
    });
  });

  describe('DELETE /api/todos/:id', () => {
    it('should delete a todo', async () => {
      const todo = await Todo.create({ text: 'Learn Jenkins' });
      
      const res = await request(app).delete(`/api/todos/${todo._id}`);
      
      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Todo deleted successfully');
      
      // Verify todo is deleted
      const deletedTodo = await Todo.findById(todo._id);
      expect(deletedTodo).toBeNull();
    });

    it('should return 404 for non-existent todo', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      
      const res = await request(app).delete(`/api/todos/${nonExistentId}`);
      
      expect(res.status).toBe(404);
      expect(res.body.message).toBe('Todo not found');
    });
  });
});