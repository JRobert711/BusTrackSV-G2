const swaggerJSDoc = require('swagger-jsdoc');

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'BusTrack SV API',
    version: '1.0.0',
    description: 'Documentación de la API de BusTrack SV',
  },
  servers: [{ url: 'http://localhost:5000/api/v1' }],
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
