import pkg from 'pg';
import dotenv from 'dotenv';
import { setTimeout as delay } from 'timers/promises';

dotenv.config();

const { Pool } = pkg;

// Enhanced configuration with defaults and validation
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'flashcards',
  connectionTimeoutMillis: 5000, // 5 seconds connection timeout
  idleTimeoutMillis: 30000, // Close idle connections after 30 seconds
  max: 20 // Maximum number of clients in the pool
};

const pool = new Pool(dbConfig);

// Connection test with retry logic
const testConnection = async (attempts = 3) => {
  for (let i = 0; i < attempts; i++) {
    try {
      const res = await pool.query('SELECT NOW()');
      console.log('✅ PostgreSQL connected successfully at', res.rows[0].now);
      return true;
    } catch (err) {
      console.error(`❌ Connection attempt ${i + 1}/${attempts} failed:`);
      console.error(err.message);
      
      if (i < attempts - 1) {
        await delay(2000); // Wait 2 seconds before retrying
      }
    }
  }
  throw new Error('Failed to connect to PostgreSQL after multiple attempts');
};

// Enhanced error handling
pool.on('error', (err) => {
  console.error('Unexpected PostgreSQL pool error:', err);
  // In production, you might want to restart the service here
});

// Verify connection on startup
testConnection()
  .catch(err => {
    console.error('Fatal database connection error:', err);
    process.exit(1); // Exit if we can't connect to DB
  });

export { pool };