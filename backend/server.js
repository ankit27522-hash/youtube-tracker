const path = require('path');
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config({ path: path.join(__dirname, '.env') });

const { connectDB } = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const playlistRoutes = require('./routes/playlistRoutes');
const videoRoutes = require('./routes/videoRoutes');
const { errorHandler, notFoundHandler } = require('./middleware/errorMiddleware');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable Cross-Origin Resource Sharing
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'YouTube Playlist Tracker API',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/playlists', playlistRoutes);
app.use('/api/videos', videoRoutes);

// Catch 404 and forward to error handler
app.use(notFoundHandler);

// Global Error Handler
app.use(errorHandler);

// Start Server after initializing database
async function startServer() {
  await connectDB();

  app.listen(PORT, () => {
    console.log('====================================================');
    console.log(` YouTube Playlist Tracker Backend running on port ${PORT}`);
    console.log(` Health check: http://localhost:${PORT}/api/health`);
    console.log('====================================================');
  });
}

startServer();
