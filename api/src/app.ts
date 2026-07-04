import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import swaggerUi from 'swagger-ui-express';
import ticketRoutes from './routes/tickets';
import connectToMongoDB from './db/mongo';
import swaggerDocs from './swagger';

// Initialize Express app
const app = express();

// Allow cors origin
app.use(cors({ origin: true }));

// Middleware
app.use(bodyParser.json());

// Initialize MongoDB connection pool
connectToMongoDB().then(connection => {
    app.locals.dbConnection = connection; // Attach connection to app.locals
}).catch(err => {
    console.error('Failed to initialize MongoDB connection:', err);
    process.exit(1);
});

// Swagger documentation route
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Routes
app.use('/api/tickets', ticketRoutes);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
