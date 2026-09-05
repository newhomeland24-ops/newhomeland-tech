const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const errorHandler = require('./middleware/errorHandler');

const authRoutes = require('./routes/authRoutes');
const propertyRoutes = require('./routes/propertyRoutes');
const settingsRoutes = require('./routes/settingsRoutes');

const app = express();

// Middleware
app.use(helmet());
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true
}));
app.use(express.json({ limit: '50kb' })); // limit payload size
app.use(express.urlencoded({ extended: true, limit: '50kb' }));
app.use(cookieParser());

// Routes
app.use('/api/auth/admin', authRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/settings', settingsRoutes);

// Error Handler
app.use(errorHandler);

module.exports = app;
