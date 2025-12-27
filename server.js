require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const leadRoutes = require('./routes/leadRoutes');
const { startAutomation } = require('./automation/syncAutomation');

const app = express();

// Middleware - CORS must come before routes
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
connectDB();

// Routes
app.use('/api/leads', leadRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Smart Lead API is running' });
});

// Root route for Vercel
app.get('/', (req, res) => {
  res.json({ 
    message: 'Smart Lead Automation API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      leads: '/api/leads',
      process: '/api/leads/process'
    }
  });
});

// Start background automation only in non-serverless environment
if (process.env.NODE_ENV !== 'production') {
  startAutomation();
}

// Start server
const PORT = process.env.PORT || 5000;

// Export for Vercel serverless
module.exports = app;

// Only start server if not in Vercel
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`\n🚀 Server running on port ${PORT}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 API: http://localhost:${PORT}/api`);
    console.log(`💚 Health: http://localhost:${PORT}/api/health\n`);
  });
}
