import swaggerJsDoc from 'swagger-jsdoc';
import { env } from './config/env';

const swaggerOptions: swaggerJsDoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Ticketmaster API',
      version: '1.0.0',
      description: 'API documentation for the Ticketmaster app',
    },
    servers: [
      { url: env.API_URL },
    ],
  },
  apis: ['./src/app/routes/*.ts'], // Path to the route files
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

export default swaggerDocs;
