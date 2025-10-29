const app = require('./app');
const { PORT } = require('./config/env');

const port = PORT || 5000;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  console.log(`Visit: http://localhost:${port}`);
  console.log('Available endpoints:');
  console.log('- GET / (health)');
  console.log('- GET /health (health)');
  console.log('- POST /api/v1/auth/login');
  console.log('- GET /api/v1/buses (requires authentication)');
  console.log('- PATCH /api/v1/buses/:id/favorite (requires authentication)');
});
