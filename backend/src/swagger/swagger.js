const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Mofa-AI Agent + Workflow Management API',
      version: '1.0.0',
      description:
        'REST API for managing AI agents and chained workflows. Register/login to get a JWT, then use it as a Bearer token.',
    },
    servers: [
      {
        url: process.env.API_BASE_URL || 'http://localhost:5000',
        description: 'Active server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: ['./src/routes/*.js'],
};

const spec = swaggerJsdoc(options);

function setupSwagger(app) {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(spec));
  app.get('/api-docs.json', (_req, res) => res.json(spec));
}

module.exports = { setupSwagger };
