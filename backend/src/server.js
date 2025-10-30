// src/server.js
// Main entry point for the Express server. Sets up middleware, routes, and error handling.

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');

// Load env vars from ../.env
dotenv.config({ path: __dirname + '/../.env' });

const connectDB = require('./config/db');
const resourceRoutes = require('./routes/resourceRoutes');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors()); // enable CORS
app.use(express.json()); // parse JSON bodies
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Routes
app.use('/api/resources', resourceRoutes);

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// Error handling middleware (should be last)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
