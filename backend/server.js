const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const { sanitizeRequestBody } = require('./middlewares/validation');

// Import routes
const authRoutes = require('./routes/authRoutes');
const publicRoutes = require('./routes/publicRoutes');
const duesRoutes = require('./routes/duesRoutes');
const maintenanceRoutes = require('./routes/maintenanceRoutes');
const announcementRoutes = require('./routes/announcementRoutes');
const reservationRoutes = require('./routes/reservationRoutes');
const parkingRoutes = require('./routes/parkingRoutes');
const userRoutes = require('./routes/userRoutes');
const reportRoutes = require('./routes/reportRoutes');
const commonAreasRoutes = require('./routes/commonAreasRoutes');
const settingsRoutes = require('./routes/settingsRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize scheduled jobs
const { initializeJobs } = require('./jobs/duesJobs');
initializeJobs();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Input sanitization middleware
app.use(sanitizeRequestBody);

// Static files for uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Serve frontend static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/build')));
}

// Root endpoint
app.get('/', (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
  } else {
    res.json({
      message: 'ASYS Backend is running 🚀',
      status: 'OK',
      version: '1.0.0',
      endpoints: {
        health: '/health',
        api: '/api',
        initDatabase: 'POST /api/init-database'
      }
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Database initialization endpoint (one-time use)
app.post('/api/init-database', async (req, res) => {
  try {
    const { initializeDatabase } = require('./scripts/initDatabase');
    const result = await initializeDatabase();
    res.json(result);
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Database initialization failed', 
      error: error.message 
    });
  }
});

// Create admin user endpoint
app.post('/api/create-admin', async (req, res) => {
  try {
    const { createAdminUser } = require('./scripts/createAdmin');
    const result = await createAdminUser();
    res.json(result);
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Admin creation failed', 
      error: error.message 
    });
  }
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/dues', duesRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/parking', parkingRoutes);
app.use('/api/users', userRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/common-areas', commonAreasRoutes);
app.use('/api/settings', settingsRoutes);

// 404 handler - must be after API routes but before error handler
app.use((req, res, next) => {
  // If it's an API request, return 404 JSON
  if (req.path.startsWith('/api')) {
    return res.status(404).json({
      error: {
        code: 'RESOURCE_NOT_FOUND',
        message: 'The requested resource was not found'
      }
    });
  }
  
  // For all other routes in production, serve the React app
  if (process.env.NODE_ENV === 'production') {
    res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
  } else {
    next();
  }
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected error occurred'
    }
  });
});

// Start server
app.listen(PORT, async () => {
  console.log(`ASYS Backend Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Database: ${process.env.DB_NAME}@${process.env.DB_HOST}:${process.env.DB_PORT}`);
  
  // Seed demo data if in development mode
  if (process.env.NODE_ENV !== 'production' && process.env.SEED_DEMO_DATA === 'true') {
    try {
      const { seedDemoData } = require('./scripts/seedDemoData');
      await seedDemoData();
    } catch (error) {
      console.error('Failed to seed demo data:', error.message);
    }
  }
});

module.exports = app;
