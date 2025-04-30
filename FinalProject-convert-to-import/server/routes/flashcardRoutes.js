import express from 'express';
import * as flashcardController from '../controllers/flashcardController.js';

const router = express.Router();

router.get('/', flashcardController.getAllFlashcards);
router.get('/:id', flashcardController.getFlashcard);
router.post('/', flashcardController.createFlashcard);
router.put('/:id', flashcardController.updateFlashcard);
router.delete('/:id', flashcardController.deleteFlashcard);

export default router;
