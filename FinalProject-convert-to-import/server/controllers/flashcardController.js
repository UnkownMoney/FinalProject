import { pool } from '../db.js';

// Enhanced validation helper with word count limit
const validateFlashcard = (question, answer) => {
  if (!question || !answer) {
    return { valid: false, error: 'Question and answer are required' };
  }
  
  // Trim inputs first
  const trimmedQuestion = question.trim();
  const trimmedAnswer = answer.trim();

  // Character length validation
  if (trimmedQuestion.length > 500 || trimmedAnswer.length > 500) {
    return { valid: false, error: 'Content cannot exceed 500 characters' };
  }

  // Word count validation
  const questionWords = trimmedQuestion.split(/\s+/).filter(word => word.length > 0);
  const answerWords = trimmedAnswer.split(/\s+/).filter(word => word.length > 0);

  if (questionWords.length > 100) {
    return { valid: false, error: 'Question cannot exceed 100 words' };
  }

  if (answerWords.length > 100) {
    return { valid: false, error: 'Answer cannot exceed 100 words' };
  }

  return { valid: true };
};

// GET all flashcards
export const getAllFlashcards = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        id,
        question,
        answer,
        created_at,
        updated_at,
        TO_CHAR(created_at, 'MM/DD/YYYY, HH12:MI:SS AM') as formatted_created_at,
        TO_CHAR(updated_at, 'MM/DD/YYYY, HH12:MI:SS AM') as formatted_updated_at
      FROM flashcards 
      ORDER BY created_at DESC
    `);
    
    res.status(200).json(result.rows);
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ 
      error: 'Failed to fetch flashcards',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// GET single flashcard
export const getFlashcard = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        id,
        question,
        answer,
        created_at,
        updated_at,
        TO_CHAR(created_at, 'MM/DD/YYYY, HH12:MI:SS AM') as formatted_created_at,
        TO_CHAR(updated_at, 'MM/DD/YYYY, HH12:MI:SS AM') as formatted_updated_at
      FROM flashcards 
      WHERE id = $1
    `, [req.params.id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Flashcard not found' });
    }
    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ 
      error: 'Failed to fetch flashcard',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// POST new flashcard
export const createFlashcard = async (req, res) => {
  const { question, answer } = req.body;

  // Validation
  const { valid, error } = validateFlashcard(question, answer);
  if (!valid) {
    return res.status(400).json({ 
      success: false,
      error 
    });
  }

  try {
    const result = await pool.query(
      `INSERT INTO flashcards (question, answer) 
       VALUES ($1, $2) 
       RETURNING 
         id,
         question,
         answer,
         created_at,
         updated_at,
         TO_CHAR(created_at, 'MM/DD/YYYY, HH12:MI:SS AM') as formatted_created_at,
         TO_CHAR(updated_at, 'MM/DD/YYYY, HH12:MI:SS AM') as formatted_updated_at`,
      [question.trim(), answer.trim()]
    );
    
    res.status(201).json({
      success: true,
      data: result.rows[0]
    });
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ 
      success: false,
      error: 'Failed to create flashcard',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// PUT update flashcard
export const updateFlashcard = async (req, res) => {
  const { id } = req.params;
  const { question, answer } = req.body;

  // Validation
  const { valid, error } = validateFlashcard(question, answer);
  if (!valid) {
    return res.status(400).json({ error });
  }

  try {
    // Check if flashcard exists
    const checkResult = await pool.query(
      'SELECT id FROM flashcards WHERE id = $1', 
      [id]
    );
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ 
        success: false,
        error: 'Flashcard not found' 
      });
    }

    // Update flashcard
    const updateResult = await pool.query(
      `UPDATE flashcards 
       SET question = $1, answer = $2, updated_at = NOW()
       WHERE id = $3 
       RETURNING 
         id,
         question,
         answer,
         created_at,
         updated_at,
         TO_CHAR(created_at, 'MM/DD/YYYY, HH12:MI:SS AM') as formatted_created_at,
         TO_CHAR(updated_at, 'MM/DD/YYYY, HH12:MI:SS AM') as formatted_updated_at`,
      [question.trim(), answer.trim(), id]
    );

    res.status(200).json({
      success: true,
      data: updateResult.rows[0]
    });
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ 
      success: false,
      error: 'Failed to update flashcard',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// DELETE flashcard
export const deleteFlashcard = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if flashcard exists first
    const checkResult = await pool.query(
      'SELECT id FROM flashcards WHERE id = $1',
      [id]
    );
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ 
        success: false,
        error: 'Flashcard not found' 
      });
    }

    // Delete flashcard
    const result = await pool.query(
      `DELETE FROM flashcards 
       WHERE id = $1 
       RETURNING id`,
      [id]
    );

    res.status(200).json({ 
      success: true,
      message: 'Flashcard deleted successfully',
      deletedId: result.rows[0].id
    });
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ 
      success: false,
      error: 'Failed to delete flashcard',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};