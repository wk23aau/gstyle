
// This file implements the main Node.js backend server setup.
// It initializes Express, loads configurations, sets up middleware,
// mounts modularized routes, and starts the server.

import express from 'express';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Import initializers and configurations
import { initializeDatabase } from './config/database.js';
// App config like ADMIN_EMAIL, MODEL_NAME are directly accessed via process.env in their respective services/routes.
// If needed, specific config values can be imported from './config/appConfig.js'.

// Import route handlers
import authRoutes from './routes/authRoutes.js';
import cvRoutes from './routes/cvRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';

const app = express();
const port = process.env.PORT || 3001;

// --- Middleware ---
app.use(express.json()); // Middleware to parse JSON bodies

// --- Initialize Database ---
// This function now also creates the DB if it doesn't exist and ensures tables are set up.
initializeDatabase().then(() => {
    console.log('Database initialization complete.');

    // --- Mount API Routes ---
    app.use('/api/auth', authRoutes);
    app.use('/api/cv', cvRoutes);
    app.use('/api/analytics', analyticsRoutes);

    // --- Basic Error Handler (Optional - can be more sophisticated) ---
    // This is a very simple error handler. For production, consider more robust error handling.
    app.use((err, req, res, next) => {
        console.error("Global Error Handler:", err.stack);
        res.status(500).send('Something broke!');
    });
    
    // --- Start Server ---
    app.listen(port, () => {
        console.log(`Backend server listening at http://localhost:${port}`);
    });

}).catch(error => {
    console.error('Failed to start the server due to database initialization error:', error);
    process.exit(1); // Exit if DB initialization fails
});