const mongoose = require('mongoose');
const Todo = require('../models/Todo');

// Test database
const MONGODB_TEST_URI = process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/jenkins_mern_test_db';

describe('Todo Model', () => {
  beforeAll(async () => {
    await mongoose.connect(MONGODB_TEST_URI);
  });

  afterAll(async () => {
    await mongoose.connection.db.dropDatabase();
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await Todo.deleteMany({});
  });

  describe('Todo creation', () => {
    it('should create a todo with valid data', async () => {
      const todoData = {
        text: 'Learn Jenkins Pipeline'
      };

      const todo = new Todo(todoData);
      const savedTodo = await todo.save();

      expect(savedTodo._id).toBeDefined();
      expect(savedTodo.text).toBe('Learn Jenkins Pipeline');
      expect(savedTodo.completed).toBe(false);
      expect(savedTodo.createdAt).toBeDefined();
      expect(savedTodo.updatedAt).toBeDefined();
    });

    it('should fail to create todo without text', async () => {
      const todo = new Todo({});

      let error;
      try {
        await todo.save();
      } catch (err) {
        error = err;
      }

      expect(error).toBeDefined();
      expect(error.errors.text).toBeDefined();
    });

    it('should trim whitespace from text', async () => {
      const todo = new Todo({ text: '  Learn Jenkins  ' });
      const savedTodo = await todo.save();

      expect(savedTodo.text).toBe('Learn Jenkins');
    });

    it('should fail for text longer than 200 characters', async () => {
      const longText = 'a'.repeat(201);
      const todo = new Todo({ text: longText });

      let error;
      try {
        await todo.save();
      } catch (err) {
        error = err;
      }

      expect(error).toBeDefined();
      expect(error.errors.text).toBeDefined();
    });
  });

  describe('Todo updates', () => {
    it('should update updatedAt field when saving', async () => {
      const todo = new Todo({ text: 'Learn Jenkins' });
      const savedTodo = await todo.save();
      
      const originalUpdatedAt = savedTodo.updatedAt;
      
      // Wait a bit to ensure time difference
      await new Promise(resolve => setTimeout(resolve, 10));
      
      savedTodo.text = 'Master Jenkins';
      const updatedTodo = await savedTodo.save();

      expect(updatedTodo.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
    });

    it('should toggle completed status', async () => {
      const todo = new Todo({ text: 'Learn Jenkins' });
      const savedTodo = await todo.save();

      expect(savedTodo.completed).toBe(false);

      savedTodo.completed = true;
      const updatedTodo = await savedTodo.save();

      expect(updatedTodo.completed).toBe(true);
    });
  });
});