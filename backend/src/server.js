import express from 'express';
import cors from 'cors';
import { connectDB } from './config/db.js';
import { config } from './config/env.js';
// import zoneRoutes from './routes/zoneRoutes.js';
// import authRoutes from './routes/authRoutes.js';
// import wasteRoutes from './routes/wasteRoutes.js';
// import feedbackRoutes from './routes/feedbackRoutes.js';
// import adminZoneRoutes from './routes/adminZoneRoutes.js';
// import adminAuthRoutes from './routes/adminAuthRoutes.js';
// import adminWasteRoutes from './routes/adminWasteRoutes.js';
// import adminUserRoutes from './routes/adminUserRoutes.js';
// import adminFeedbackRoutes from './routes/adminFeedbackRoutes.js';
// import adminDashboardRoutes from './routes/adminDashboardRoutes.js';
// import adminAnalyticsRoutes from './routes/adminAnalyticsRoutes.js';
// import generatorDetailsRoutes from './routes/generatorDetailsRoutes.js';
// import adminNotificationRoutes from './routes/adminNotificationRoutes.js';
// import notificationRoutes from './routes/notificationRoutes.js';

// Initialize Express app
const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Health check route
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
// app.use('/api/auth', authRoutes);
// app.use('/api/waste', wasteRoutes);
// app.use('/api/feedback', feedbackRoutes);
// app.use('/api/zones', zoneRoutes);
// app.use('/api/generator-details', generatorDetailsRoutes);
// app.use('/api/admin', adminAuthRoutes);
// app.use('/api/admin/reports', adminWasteRoutes);
// app.use('/api/admin/users', adminUserRoutes);
// app.use('/api/admin/feedback', adminFeedbackRoutes);
// app.use('/api/admin/notifications', adminNotificationRoutes);
// app.use('/api/admin/summary', adminDashboardRoutes);
// app.use('/api/admin/analytics', adminAnalyticsRoutes);
// app.use('/api/admin/zones', adminZoneRoutes);
// app.use('/api/notifications', notificationRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    error: config.nodeEnv === 'development' ? err.stack : undefined,
  });
});

// Start server
const PORT = config.port;
app.listen(PORT, () => {
  console.log(`Server running in ${config.nodeEnv} mode on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received: closing HTTP server');
  // TODO: Close database connection
  process.exit(0);
});

export default app;

