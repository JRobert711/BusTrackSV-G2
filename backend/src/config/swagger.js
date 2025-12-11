const swaggerJSDoc = require('swagger-jsdoc');
const config = require('./env');

// Build server URL from configuration
const getServerUrl = () => {
  const port = config.port.PORT;
  const host = config.server.HOST === '0.0.0.0' ? 'localhost' : config.server.HOST;
  const protocol = config.env.NODE_ENV === 'production' ? 'https' : 'http';
  return `${protocol}://${host}:${port}/api/v1`;
};

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'BusTrack SV API',
    version: '1.0.0',
    description: 'Documentación de la API de BusTrack SV',
  },
  servers: [{ url: getServerUrl() }],
  components: {
    securitySchemes: {
      bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
    },
  },
  security: [{ bearerAuth: [] }],
};

const options = {
  swaggerDefinition,
  apis: [
    'src/routes/*.js',
    'src/controllers/*.js',
  ],
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = { swaggerSpec };
