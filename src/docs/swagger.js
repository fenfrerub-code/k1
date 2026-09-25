const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'OrderHub API',
      version: '1.0.0',
      description:
        'API quan ly don hang da san (Shopee, TikTok Shop, Lazada) cho seller. ' +
        'MVP - hien dang dung MockIntegrationAdapter, chua ket noi API that cua cac san/hang van chuyen.',
    },
    servers: [{ url: '/api', description: 'API goc' }],
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      },
    },
  },
  apis: ['./src/routes/*.js'],
};

module.exports = swaggerJsdoc(options);
