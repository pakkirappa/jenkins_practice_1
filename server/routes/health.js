const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// Health check endpoint
router.get('/', async (req, res) => {
  try {
    // Check database connection
    const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    
    const healthData = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      version: '1.0.0',
      database: {
        status: dbStatus,
        name: mongoose.connection.name || 'jenkins_mern_db'
      },
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      jenkins: {
        buildNumber: process.env.BUILD_NUMBER || 'local',
        buildId: process.env.BUILD_ID || 'dev',
        jobName: process.env.JOB_NAME || 'local-development',
        gitCommit: process.env.GIT_COMMIT || 'unknown'
      }
    };

    res.json(healthData);
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

// Detailed health check
router.get('/detailed', async (req, res) => {
  try {
    const Todo = require('../models/Todo');
    const todoCount = await Todo.countDocuments();
    
    const detailedHealth = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        api: 'operational',
        database: mongoose.connection.readyState === 1 ? 'operational' : 'down',
        todos: {
          total: todoCount,
          status: 'operational'
        }
      },
      system: {
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
        pid: process.pid
      }
    };

    res.json(detailedHealth);
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

module.exports = router;