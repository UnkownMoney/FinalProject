import db from '../db.js';

const Flashcard = {
  async getAll() {
    const res = await db.query('SELECT * FROM flashcards');
    return res.rows;
  },

  async create({ question, answer }) {
    const res = await db.query(
      'INSERT INTO flashcards (question, answer) VALUES ($1, $2) RETURNING *',
      [question, answer]
    );
    return res.rows[0];
  }
};

export default Flashcard;
