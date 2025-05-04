import express from 'express';
import cors from 'cors';
import path from 'path';
import flashcardRoutes from './routes/flashcardRoutes.js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

dotenv.config();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Enhanced CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

// Middleware - order matters!
app.use(express.json()); // MUST come before routes
app.use(express.urlencoded({ extended: true }));

// API Routes - mounted before static files
app.use('/api/flashcards', flashcardRoutes);

// Serve static files (HTML, JS, CSS)
app.use(express.static(path.join(__dirname, 'public')));

// HTML page routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'view-cards.html'));
});

app.get('/add-card', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'add-card.html'));
});

app.get('/study-mode', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'study-mode.html'));
});

// Debugging middleware (temporary)
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// Error handlers
app.use((req, res) => {
  console.warn(`404: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ message: 'Route not found' });
});

app.use((err, req, res, next) => {
  console.error(`500: ${err.stack}`);
  res.status(500).json({ message: 'Internal server error' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API Base: /api/flashcards`);
  console.log(`Static files served from: ${path.join(__dirname, 'public')}`);
});