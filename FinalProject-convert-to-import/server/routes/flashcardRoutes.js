import express from 'express';
import * as flashcardController from '../controllers/flashcardController.js';

const router = express.Router();

// API Endpoints
router.get('/', flashcardController.getAllFlashcards);       // GET /api/flashcards
router.get('/:id', flashcardController.getFlashcard);       // GET /api/flashcards/:id
router.post('/', flashcardController.createFlashcard);      // POST /api/flashcards
router.put('/:id', flashcardController.updateFlashcard);    // PUT /api/flashcards/:id
router.delete('/:id', flashcardController.deleteFlashcard); // DELETE /api/flashcards/:id

export default router;