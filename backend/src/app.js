const express = require('express');
const cors = require('cors');

const apiRouter = require('./routes');
const healthRoutes = require('./routes/health.routes');
const { notFound } = require('./middlewares/notFound.middleware');
const { errorHandler } = require('./middlewares/error.middleware');

const app = express();

// Core middlewares
app.use(cors());
app.use(express.json());

// Public health endpoints (no versioned) to keep root working
app.use('/', healthRoutes);

// Versioned API
app.use('/api/v1', apiRouter);

// 404 and error handlers
app.use(notFound);
app.use(errorHandler);

module.exports = app;
