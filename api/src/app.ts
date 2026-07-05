import { env } from './config/env';

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import bodyParser from 'body-parser';
import swaggerUi from 'swagger-ui-express';
import ticketRoutes from './app/routes/ticket';
import connectToMongoDB from './db/mongo';
import swaggerDocs from './swagger';
import errorHandler from './middleware/errorHandler';
import { corsOptions } from './config/cors';
import logger from './config/logger';
import requestLogger from './config/requestLogger';

// Initialize Express app
const app = express();

// Security headers
app.use(helmet());

// Request logging
app.use(requestLogger);

// Allow cors origin
app.use(cors(corsOptions));

// Middleware
app.use(bodyParser.json());

// Initialize MongoDB connection
connectToMongoDB();

// Swagger documentation route
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Routes
app.use('/api/tickets', ticketRoutes);

// Error handling (must be registered after routes)
app.use(errorHandler);

// Start server
app.listen(env.PORT, () => {
	logger.info(`Server is running on ${env.API_URL}`);
});
