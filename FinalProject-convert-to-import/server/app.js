import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. Enhanced CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// 2. Security middleware
app.disable('x-powered-by');
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// 3. Static files with cache control
const publicPath = path.join(__dirname, 'public');
app.use(express.static(publicPath, {
  maxAge: process.env.NODE_ENV === 'production' ? '1d' : '0',
  etag: true,
  lastModified: true,
  setHeaders: (res, path) => {
    if (path.endsWith('.html')) {
      res.set('Cache-Control', 'no-store');
    }
  }
}));

// 4. Route handlers
const setupRoutes = async () => {
  try {
    const flashcardRoutes = (await import('./routes/flashcardRoutes.js')).default;
    app.use('/api/flashcards', flashcardRoutes);
    console.log('✅ Flashcard routes loaded');
  } catch (err) {
    console.error('❌ Failed to load flashcard routes:', err);
    process.exit(1); // Exit if critical routes fail
  }
};

// 5. HTML routes (simplified)
const htmlRoutes = [
  { path: '/', file: 'index.html' },
  { path: '/add-card', file: 'add-card.html' },
  { path: '/view-cards', file: 'view-cards.html' },
  { path: '/study-mode', file: 'study-mode.html' },
  { path: '/edit-card', file: 'edit-card.html' } // Added missing route
];

htmlRoutes.forEach(({ path: routePath, file }) => {
  app.get(routePath, (req, res) => {
    res.sendFile(path.join(publicPath, file));
  });
});

// 6. Error handling middleware
app.use((err, req, res, next) => {
  console.error('🔥 Server Error:', err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

// 7. Start server
const startServer = async () => {
  await setupRoutes();
  
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📁 Static files served from: ${publicPath}`);
    
    // Log available routes
    console.log('\n🌐 Available Routes:');
    htmlRoutes.forEach(({ path }) => {
      console.log(`http://localhost:${PORT}${path}`);
    });
  });
};

startServer();