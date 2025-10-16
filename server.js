import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 10000;

// Middleware to log all requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Health check endpoint - must be before static files
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'bringus-frontend'
  });
});

// Check if dist directory exists
const distPath = path.join(__dirname, 'dist');
const indexPath = path.join(distPath, 'index.html');

console.log('🔍 Checking paths:');
console.log('   __dirname:', __dirname);
console.log('   dist path:', distPath);
console.log('   dist exists:', existsSync(distPath));
console.log('   index.html exists:', existsSync(indexPath));

if (!existsSync(distPath)) {
  console.error('❌ ERROR: dist directory not found!');
  console.error('   Please ensure "npm run build" was successful');
  process.exit(1);
}

if (!existsSync(indexPath)) {
  console.error('❌ ERROR: index.html not found in dist directory!');
  process.exit(1);
}

// Serve static files from the dist directory
app.use(express.static(distPath, {
  maxAge: '1d',
  etag: true
}));

// Handle client-side routing - send all requests to index.html
app.get('*', (req, res, next) => {
  try {
    res.sendFile(indexPath, (err) => {
      if (err) {
        console.error('Error sending index.html:', err);
        next(err);
      }
    });
  } catch (error) {
    console.error('Error in route handler:', error);
    next(error);
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'production' ? 'Something went wrong' : err.message
  });
});

// Start server
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log('='.repeat(50));
  console.log(`✅ Server is running successfully!`);
  console.log(`🌐 URL: http://0.0.0.0:${PORT}`);
  console.log(`📁 Serving from: ${distPath}`);
  console.log(`🏥 Health check: http://0.0.0.0:${PORT}/health`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log('='.repeat(50));
});

// Handle server errors
server.on('error', (error) => {
  console.error('❌ Server Error:', error);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM received, shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('👋 SIGINT received, shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

