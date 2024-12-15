import swaggerJSDoc from 'swagger-jsdoc';

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Comaint API',
      version: '0.1.0',
      description: 'Documentation de l’API Comaint',
    },
  },
  apis: ['src/routes/*.js'],
};

const swaggerConfig = swaggerJSDoc(swaggerOptions);
export default swaggerConfig;
