// Healthcheck script for Docker container
const http = require('http');

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/health',
  method: 'GET',
  timeout: 5000
};

const req = http.request(options, (res) => {
  if (res.statusCode === 200) {
    process.exit(0); // Success
  } else {
    process.exit(1); // Failure
  }
});

req.on('error', () => {
  process.exit(1); // Failure
});

req.on('timeout', () => {
  req.destroy();
  process.exit(1); // Failure
});

req.end();