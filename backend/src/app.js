const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const errorHandler = require('./middleware/errorHandler');

const authRoutes = require('./routes/authRoutes');
const propertyRoutes = require('./routes/propertyRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const inquiryRoutes = require('./routes/inquiryRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');

const app = express();

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

// Allowed origins for CORS (Production custom domains, Cloudflare Pages previews, and local dev)
const allowedOrigins = [
  'https://newhomedevelopers.in',
  'https://www.newhomedevelopers.in',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000'
];

if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL.replace(/\/+$/, ''));
}

const corsOptions = {
  origin: (origin, callback) => {
    // Allow server-to-server, mobile, curl, or monitoring pings with no origin
    if (!origin) return callback(null, true);

    // Allow explicitly defined domains
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    try {
      const url = new URL(origin);
      // Allow any newhomedevelopers.in domain & subdomain (e.g., apex, www, admin)
      if (
        url.hostname === 'newhomedevelopers.in' ||
        url.hostname.endsWith('.newhomedevelopers.in')
      ) {
        return callback(null, true);
      }

      // Allow any Cloudflare Pages deployment (*.pages.dev)
      if (url.hostname.endsWith('.pages.dev')) {
        return callback(null, true);
      }
    } catch {
      // Invalid URL format
    }

    return callback(null, false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json({ limit: '50kb' })); // limit payload size
app.use(express.urlencoded({ extended: true, limit: '50kb' }));
app.use(cookieParser());

// Lightweight Health Check (Instant 200 OK for Render & UptimeRobot pings without DB dependency)
app.get(['/health', '/api/health'], (req, res) => res.status(200).send('OK'));

// Diagnostic Database Health Check
app.get('/health/detail', (req, res) => {
  const isDbConnected = mongoose.connection.readyState === 1;
  res.status(isDbConnected ? 200 : 503).json({
    status: isDbConnected ? 'healthy' : 'degraded',
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    database: isDbConnected ? 'connected' : 'disconnected'
  });
});

// Routes
app.use('/api/auth/admin', authRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/admin/settings', settingsRoutes);
app.use('/api/inquiries', inquiryRoutes);
app.use('/api/appointments', appointmentRoutes);

// Error Handler
app.use(errorHandler);

module.exports = app;
