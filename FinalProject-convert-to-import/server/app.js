import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from /public
const publicPath = path.join(__dirname, 'public');
app.use(express.static(publicPath));

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Import and use flashcard API routes
let flashcardRoutes;
try {
  flashcardRoutes = (await import('./routes/flashcardRoutes.js')).default;
  app.use('/api/flashcards', flashcardRoutes);
  console.log('Flashcard routes loaded successfully');
} catch (err) {
  console.error('Failed to load flashcard routes:', err);
}

// HTML page routes
app.get('/', (req, res) => {
  res.sendFile(path.join(publicPath, 'index.html'));
});

app.get('/add-card', (req, res) => {
  res.sendFile(path.join(publicPath, 'add-card.html'));
});

app.get('/view-cards', (req, res) => {
  res.sendFile(path.join(publicPath, 'view-cards.html'));
});

app.get('/study-mode', (req, res) => {
  res.sendFile(path.join(publicPath, 'study-mode.html'));
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
