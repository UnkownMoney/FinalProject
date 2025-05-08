import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Basic configuration first
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
const publicPath = path.join(__dirname, 'public');
app.use(express.static(publicPath));


app.use(express.static(publicPath));

// Simple test route to verify server is working
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Import routes with error handling
let flashcardRoutes;
try {
  flashcardRoutes = (await import('./routes/flashcardRoutes.js')).default;
  app.use('/api/flashcards', flashcardRoutes);
  console.log('Flashcard routes loaded successfully');
} catch (err) {
  console.error('Failed to load flashcard routes:', err);
}

// Basic HTML routes
app.get(['/', '/view-cards', '/add-card', '/study-mode'], (req, res) => {
  res.sendFile(path.join(publicPath, 'index.html'));
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Static files path: ${publicPath}`);
});