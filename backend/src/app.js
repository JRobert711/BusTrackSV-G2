const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');
const { swaggerSpec } = require('./config/swagger');

const apiRouter = require('./routes');
const healthRoutes = require('./routes/health.routes');
const { notFound } = require('./middlewares/notFound.middleware');
const { errorHandler } = require('./middlewares/error.middleware');

const app = express();

// Core middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Public health endpoints (no versioned) to keep root working
app.use('/', healthRoutes);

// API Docs
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Versioned API
app.use('/api/v1', apiRouter);

// 404 and error handlers
app.use(notFound);
app.use(errorHandler);

module.exports = app;
