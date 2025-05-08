import express from 'express';
import * as flashcardController from '../controllers/flashcardController.js';
import { pool } from '../db.js';  

const router = express.Router();

// ID Validation Middleware - simplified
const validateId = (req, res, next, id) => {
  const numId = Number(id);
  if (!Number.isInteger(numId) || numId <= 0) {
    return res.status(400).json({ 
      success: false,
      message: 'Invalid flashcard ID format'
    });
  }
  req.validatedId = numId;  // Store the validated ID
  next();
};

router.param('id', validateId);

// Request Validation Middleware
const validateFlashcard = (req, res, next) => {
  const { question, answer } = req.body;
  if (!question?.trim() || !answer?.trim()) {
    return res.status(400).json({
      success: false,
      message: 'Both question and answer are required'
    });
  }
  next();
};

// API Endpoints with explicit route definitions
router.route('/')
  .get(flashcardController.getAllFlashcards)
  .post(validateFlashcard, flashcardController.createFlashcard);

  router.route('/:id')// Explicitly matches only numeric IDs
  .get(flashcardController.getFlashcard)
  .put(validateFlashcard, flashcardController.updateFlashcard)
  .delete(flashcardController.deleteFlashcard);

// Card Count Endpoint
router.get('/count/new', async (req, res) => {  // Changed from '/count' to '/count/new'
  try {
    const result = await pool.query('SELECT COUNT(*) FROM flashcards');
    res.json({ 
      success: true,
      count: parseInt(result.rows[0].count, 10)  // Added radix parameter
    });
  } catch (err) {
    console.error('Card count error:', err);
    res.status(500).json({ 
      success: false,
      message: 'Failed to get card count',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// Debug route to test router is working
router.get('/debug/test', (req, res) => {
  res.json({ message: 'Router is working correctly' });
});

export default router;