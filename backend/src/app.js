const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');
const { swaggerSpec } = require('./config/swagger');

const app = express();

// Core middlewares
app.use(helmet());
app.use(cors());

// 2. Body Parsers - Parse JSON and URL-encoded bodies
app.use(express.json());
app.use(morgan('dev'));

  // Update response
  response.error = message;
  response.type = errorType;

// API Docs
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Versioned API
app.use('/api/v1', apiRouter);

  res.status(status).json(response);
});

module.exports = app;
