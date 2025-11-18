const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');
const { swaggerSpec } = require('./config/swagger');

const apiRouter = require('./routes');
const healthRouter = require('./routes/health.routes');
const { notFound } = require('./middlewares/notFound.middleware');
const { errorHandler } = require('./middlewares/error.middleware');

const app = express();

// Core middlewares
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: false // Disable CSP for development
}));
const { corsOptions } = require('./config/cors');
app.use(cors(corsOptions));
app.use(express.json());
app.use(morgan('dev'));

// Add preflight handling
app.options('*', cors(corsOptions));

// API Docs
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Health endpoints (root)
app.use('/', healthRouter);

// Versioned API
app.use('/api/v1', apiRouter);

// 404 handler
app.use(notFound);

// Error handler
app.use(errorHandler);

module.exports = app;
