const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');
const { swaggerSpec } = require('./config/swagger');
const apiRouter = require('./routes');
const healthRoutes = require('./routes/health.routes');
const { errorHandler } = require('./middlewares/error.middleware');
const { notFound } = require('./middlewares/notFound.middleware');

const app = express();

// Core middlewares
app.use(helmet());
app.use(cors());

// Body Parsers - Parse JSON and URL-encoded bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// API Docs
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Health check routes (before versioned API)
app.use('/', healthRoutes);

// Versioned API
app.use('/api/v1', apiRouter);

// 404 handler (must be after all routes)
app.use(notFound);

// Error handler (must be last)
app.use(errorHandler);

module.exports = app;
