
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'aicvmakeroauth',
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

let dbPool;

// Constants for credits
const DEFAULT_CREDITS_REGISTERED = 50;

async function initializeDatabase() {
  try {
    // Create a temporary connection to create the database if it doesn't exist
    const tempConnectionForDbCreation = await mysql.createConnection({
      host: dbConfig.host,
      user: dbConfig.user,
      password: dbConfig.password,
      port: dbConfig.port,
    });
    // Use placeholder for database name to prevent SQL injection and handle escaping correctly
    await tempConnectionForDbCreation.query('CREATE DATABASE IF NOT EXISTS ??', [dbConfig.database]);
    await tempConnectionForDbCreation.end();
    console.log(`Database '${dbConfig.database}' ensured.`);

    // Now create the pool for the specified database
    dbPool = mysql.createPool(dbConfig);
    const connection = await dbPool.getConnection();
    console.log('Successfully connected to MySQL database pool.');

    try {
      // Ensure the users table exists and has the correct schema
      await connection.query(`
        CREATE TABLE IF NOT EXISTS users (
          id INT AUTO_INCREMENT PRIMARY KEY,
          email VARCHAR(255) NOT NULL UNIQUE,
          password VARCHAR(255) NULL, 
          name VARCHAR(255),
          google_id VARCHAR(255) UNIQUE NULL,
          role VARCHAR(50) DEFAULT 'user',
          is_email_verified BOOLEAN DEFAULT FALSE,
          email_verification_token VARCHAR(255) NULL,
          email_verification_token_expires_at TIMESTAMP NULL,
          password_reset_token VARCHAR(255) NULL,
          password_reset_token_expires_at TIMESTAMP NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
      console.log('Users table core structure ensured.');

      // Add or modify columns if they don't exist or need updating (idempotent changes)
      const columnsOperations = [
        { name: 'google_id', type: 'VARCHAR(255) UNIQUE NULL', check: async () => {} }, 
        { name: 'role', type: "VARCHAR(50) DEFAULT 'user'", check: async () => { 
            const [cols] = await connection.query(`SHOW COLUMNS FROM users LIKE 'role';`); 
            if (cols.length > 0 && (!cols[0].Default || cols[0].Default.toLowerCase() !== "'user'")) {
                 await connection.query(`ALTER TABLE users MODIFY COLUMN role VARCHAR(50) DEFAULT 'user';`);
                 console.log("Updated role column default if necessary."); 
            }
        }},
        { name: 'is_email_verified', type: 'BOOLEAN DEFAULT FALSE', check: async () => {} }, 
        { name: 'email_verification_token', type: 'VARCHAR(255) NULL', check: async () => {} },
        { name: 'email_verification_token_expires_at', type: 'TIMESTAMP NULL', check: async () => {} },
        { name: 'password_reset_token', type: 'VARCHAR(255) NULL', check: async () => {} },
        { name: 'password_reset_token_expires_at', type: 'TIMESTAMP NULL', check: async () => {} },
        { name: 'password', type: 'VARCHAR(255) NULL', check: async () => { 
            const [cols] = await connection.query("SHOW COLUMNS FROM users LIKE 'password';"); 
            if (cols.length > 0 && cols[0].Null === 'NO') {
                await connection.query("ALTER TABLE users MODIFY COLUMN password VARCHAR(255) NULL;");
                console.log('Modified password column to be nullable if it was NOT NULL.');
            }
        }},
        // New columns for credit system
        { name: 'credits_available', type: `INT DEFAULT ${DEFAULT_CREDITS_REGISTERED} NULL` },
        { name: 'credits_last_reset_date', type: 'DATE NULL' }
      ];

      for (const col of columnsOperations) {
        
        const [existingCols] = await connection.query(`SHOW COLUMNS FROM users LIKE '${col.name}';`);
        
        if (existingCols.length === 0) {
          await connection.query(`ALTER TABLE users ADD COLUMN ${col.name} ${col.type};`);
          console.log(`Added column '${col.name}' to users table.`);
        } else if (col.check) {
          await col.check(); 
        }
      }
      console.log('Users table schema is up to date with credit system columns.');

      // Ensure the saved_cvs table exists
      await connection.query(`
        CREATE TABLE IF NOT EXISTS saved_cvs (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            job_info_query TEXT NOT NULL,
            generated_cv_text LONGTEXT NOT NULL,
            cv_title VARCHAR(255) NOT NULL,
            tags JSON,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );
      `);
      console.log('saved_cvs table ensured.');

    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Failed to initialize or connect to database:', error);
    if (dbPool && typeof dbPool.end === 'function') {
      await dbPool.end();
    }
    throw error; 
  }
}

export { dbPool, initializeDatabase, DEFAULT_CREDITS_REGISTERED };