
// This file implements a Node.js backend server.
// Dependencies: express, @google/genai, dotenv, mysql2, bcrypt, google-auth-library
// Ensure .env file has API_KEY, DB credentials, and GOOGLE_CLIENT_ID.

import express from 'express';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';
import { OAuth2Client } from 'google-auth-library';

dotenv.config(); // To load API_KEY, DB credentials, and GOOGLE_CLIENT_ID from .env file

const app = express();
const port = process.env.PORT || 3001; // Backend server port
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@aicvmaker.com'; // Define an admin email

// --- Middleware ---
app.use(express.json()); // To parse JSON request bodies

// --- MySQL Database Setup ---
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'aicvmakeroauth',
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

let db;

async function initializeDatabase() {
  try {
    const tempConnectionForDbCreation = await mysql.createConnection({
      host: dbConfig.host,
      user: dbConfig.user,
      password: dbConfig.password,
      port: dbConfig.port
    });
    await tempConnectionForDbCreation.query(`CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\`;`);
    await tempConnectionForDbCreation.end();
    console.log(`Database '${dbConfig.database}' ensured.`);

    db = mysql.createPool(dbConfig);
    const connection = await db.getConnection(); 
    console.log('Successfully connected to MySQL database pool.');

    try {
      await connection.query(`
        CREATE TABLE IF NOT EXISTS users (
          id INT AUTO_INCREMENT PRIMARY KEY,
          email VARCHAR(255) NOT NULL UNIQUE,
          password VARCHAR(255), 
          name VARCHAR(255),
          google_id VARCHAR(255) UNIQUE,
          role VARCHAR(50) DEFAULT 'user', -- Added role column
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
      console.log('Users table core structure ensured (with role).');

      const [googleIdColumns] = await connection.query("SHOW COLUMNS FROM users LIKE 'google_id';");
      // @ts-ignore
      if (googleIdColumns.length === 0) {
        await connection.query('ALTER TABLE users ADD COLUMN google_id VARCHAR(255) UNIQUE;');
        console.log('Added google_id column to users table.');
      }

      const [roleColumns] = await connection.query("SHOW COLUMNS FROM users LIKE 'role';");
       // @ts-ignore
      if (roleColumns.length === 0) {
        await connection.query("ALTER TABLE users ADD COLUMN role VARCHAR(50) DEFAULT 'user';");
        console.log('Added role column to users table.');
      } else {
         // @ts-ignore
        if (!roleColumns[0].Default || roleColumns[0].Default.toLowerCase() !== "'user'") {
            // Check if it's already 'user' with quotes, some DBs return it like that
            await connection.query("ALTER TABLE users MODIFY COLUMN role VARCHAR(50) DEFAULT 'user';");
            console.log("Updated role column to have default 'user'.");
        }
      }
      
      const [passwordColumns] = await connection.query("SHOW COLUMNS FROM users LIKE 'password';");
      // @ts-ignore
      if (passwordColumns.length > 0 && passwordColumns[0].Null === 'NO') {
        await connection.query("ALTER TABLE users MODIFY COLUMN password VARCHAR(255) NULL;");
        console.log('Modified password column to be nullable.');
      }
      
      console.log('Users table schema is up to date.');

    } finally {
      connection.release();
    }

  } catch (error) {
    console.error('Failed to initialize or connect to database:', error);
    process.exit(1);
  }
}

initializeDatabase();

// --- Gemini AI Setup ---
const geminiApiKey = process.env.API_KEY;
if (!geminiApiKey) {
  console.error("CRITICAL: API_KEY for Gemini is not set in environment variables. CV generation will fail.");
}
const ai = new GoogleGenAI({ apiKey: geminiApiKey || "FALLBACK_KEY_IF_ENV_FAILS" });
const MODEL_NAME = 'gemini-1.5-flash-latest';

// --- Google OAuth Client Setup ---
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
if (!GOOGLE_CLIENT_ID) {
    console.error("CRITICAL: GOOGLE_CLIENT_ID is not set in environment variables. Google Sign-In will fail.");
}
const googleOAuthClient = new OAuth2Client(GOOGLE_CLIENT_ID);


// --- Authentication API Routes ---

app.post('/api/auth/signup', async (req, res) => {
  const { email, password, name } = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({ message: 'Email, password, and name are required for signup.' });
  }
  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters.' });
  }

  try {
    const [existingUsers] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    // @ts-ignore
    if (existingUsers.length > 0) {
      return res.status(409).json({ message: 'Email already exists. Try logging in or use a different email.' });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const role = email.toLowerCase() === ADMIN_EMAIL.toLowerCase() ? 'admin' : 'user';

    const [result] = await db.query(
      'INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)',
      [email, hashedPassword, name, role]
    );
    // @ts-ignore
    const insertId = result.insertId;
    const userToReturn = { id: insertId, email, name, role };

    console.log('User signed up with email/password:', userToReturn);
    res.status(201).json({
      user: userToReturn,
      token: `mock-jwt-token-for-${insertId}`,
      message: 'Signup successful'
    });
  } catch (error) {
    console.error('Email signup error:', error);
    res.status(500).json({ message: 'An error occurred during signup.' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required for login.' });
  }

  try {
    const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    // @ts-ignore
    if (users.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }
    // @ts-ignore
    const user = users[0];

    if (!user.password) {
        return res.status(401).json({ message: 'This account may have been registered via Google or password is not set. Please use Sign in with Google or check your credentials.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }
    
    // Ensure role is correctly assigned even on normal login for admin
    if (user.email.toLowerCase() === ADMIN_EMAIL.toLowerCase() && user.role !== 'admin') {
        await db.query('UPDATE users SET role = ? WHERE id = ?', ['admin', user.id]);
        user.role = 'admin';
    }


    const userToReturn = { id: user.id, email: user.email, name: user.name, role: user.role };
    console.log('User logged in with email/password:', userToReturn);
    res.status(200).json({
      user: userToReturn,
      token: `mock-jwt-token-for-${user.id}`,
      message: 'Login successful'
    });
  } catch (error) {
    console.error('Email login error:', error);
    res.status(500).json({ message: 'An error occurred during login.' });
  }
});

app.post('/api/auth/google-signin', async (req, res) => {
  const { idToken } = req.body;

  if (!idToken) {
    return res.status(400).json({ message: 'Google ID Token is required.' });
  }
  if (!GOOGLE_CLIENT_ID) {
    console.error("Google Sign-In attempt failed: GOOGLE_CLIENT_ID not set on server.");
    return res.status(500).json({ message: 'Google Sign-In is not configured on the server (missing Client ID).' });
  }

  try {
    const ticket = await googleOAuthClient.verifyIdToken({
        idToken: idToken,
        audience: GOOGLE_CLIENT_ID, 
    });
    const payload = ticket.getPayload();

    if (!payload || !payload.email || !payload.sub) {
        return res.status(400).json({ message: 'Invalid Google ID token payload.' });
    }
    
    const { email, name: googleName, sub: googleId } = payload; // Renamed name to googleName to avoid conflict
    const userEmail = payload.email_verified ? email : null; 

    if (!userEmail) {
        return res.status(400).json({ message: 'Google email not verified or not provided.' });
    }

    const assignedRole = userEmail.toLowerCase() === ADMIN_EMAIL.toLowerCase() ? 'admin' : 'user';

    let [usersFromDb] = await db.query('SELECT * FROM users WHERE google_id = ? OR email = ?', [googleId, userEmail]);
    // @ts-ignore
    let user = usersFromDb[0];

    if (user) { // User exists
      let roleToUpdate = user.role;
      if (user.email.toLowerCase() === ADMIN_EMAIL.toLowerCase() && user.role !== 'admin') {
        roleToUpdate = 'admin'; // Elevate to admin if email matches
      } else if (user.email.toLowerCase() !== ADMIN_EMAIL.toLowerCase() && user.role === 'admin') {
        // Optional: Demote if email no longer matches admin (e.g. admin email changed)
        // roleToUpdate = 'user';
      }

      let fieldsToUpdate = [];
      let valuesToUpdate = [];

      if (!user.google_id && user.email === userEmail) {
        fieldsToUpdate.push('google_id = ?');
        valuesToUpdate.push(googleId);
      }
      if (roleToUpdate !== user.role) {
        fieldsToUpdate.push('role = ?');
        valuesToUpdate.push(roleToUpdate);
      }
      // Update name if it's missing or different from Google's name (and not empty from Google)
      if (googleName && user.name !== googleName) {
        fieldsToUpdate.push('name = ?');
        valuesToUpdate.push(googleName);
      }


      if (fieldsToUpdate.length > 0) {
        await db.query(`UPDATE users SET ${fieldsToUpdate.join(', ')} WHERE id = ?`, [...valuesToUpdate, user.id]);
         // Re-fetch user to get all updated fields including potentially new role or name
        const [refetchedUser] = await db.query('SELECT * FROM users WHERE id = ?', [user.id]);
        // @ts-ignore
        user = refetchedUser[0];
      }
      
      console.log('User logged in/updated via Google:', { id: user.id, email: user.email, name: user.name, role: user.role });
    } else { // New user
      const [result] = await db.query(
        'INSERT INTO users (email, name, google_id, role) VALUES (?, ?, ?, ?)',
        [userEmail, googleName || userEmail.split('@')[0], googleId, assignedRole]
      );
      // @ts-ignore
      const insertId = result.insertId;
      user = { id: insertId, email: userEmail, name: googleName || userEmail.split('@')[0], google_id: googleId, role: assignedRole };
      console.log('User auto-registered via Google:', user);
    }

    const userToReturn = { id: user.id, email: user.email, name: user.name, role: user.role };
    res.status(200).json({
      user: userToReturn,
      token: `mock-jwt-google-token-for-${user.id}`,
      message: 'Google Sign-In successful'
    });

  } catch (error) {
    console.error('Google Sign-In error:', error);
    if (error.message && (error.message.includes("Token used too late") || error.message.includes("Invalid token signature") || error.message.includes("The verificarion failed") )) {
        return res.status(401).json({ message: 'Google session token is invalid or expired. Please try signing in again.' });
    }
    if(error.code === 'ER_BAD_FIELD_ERROR' || error.sqlMessage?.includes("Unknown column")){
        return res.status(500).json({message: "Database schema error. Please contact support."});
    }
    res.status(500).json({ message: 'An error occurred during Google Sign-In verification.' });
  }
});


// --- CV Generation API Route ---
app.post('/api/cv/generate', async (req, res) => {
  const { jobInfo } = req.body;

  if (!jobInfo || typeof jobInfo !== 'string' || !jobInfo.trim()) {
    return res.status(400).json({ message: 'Job information is required and must be a non-empty string.' });
  }

  if (!geminiApiKey) {
     return res.status(500).json({ message: "Gemini API Key is not configured on the server." });
  }

  const prompt = `
You are an expert CV writer. Your task is to generate a structured CV outline based on the provided job information.
If the input is primarily a job title, suggest typical sections, key skills, and example achievements relevant to that role.
If the input is a detailed job description, extract key responsibilities, required skills (hard and soft), and qualifications. Then, structure these into a comprehensive CV outline.
The output should be plain text, well-formatted with clear headings for each section (e.g., using Markdown-like headings like ## Section Name ## or **Section Name**).
Provide actionable and specific suggestions. For example, instead of just "Skills", list specific skills relevant to the job info.

Job Information:
---
${jobInfo}
---
CV Outline:
`;

  try {
    if (!ai.models || typeof ai.models.generateContent !== 'function') {
      console.error('Error: ai.models.generateContent is not available. SDK usage might be incorrect or version mismatch.');
      return res.status(500).json({ message: 'Server configuration error with AI model access.' });
    }

    const result = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
    });
    
    const textOutput = result.text;

    if (textOutput === null || textOutput === undefined || textOutput.trim() === "") {
        console.error('Gemini API returned an empty or invalid text response.');
        return res.status(500).json({ message: 'Received an empty or invalid response from the AI model.' });
    }
    
    res.json({ cvContent: textOutput });

  } catch (error) {
    console.error('Error generating CV content with Gemini API:', error);
    let errorMessage = 'An unknown error occurred while communicating with the AI model.';
    if (error instanceof Error) {
        const lowerErrorMessage = error.message.toLowerCase();
        if (lowerErrorMessage.includes("api key not valid") ||
            (lowerErrorMessage.includes("api key") && (lowerErrorMessage.includes("invalid") || lowerErrorMessage.includes("missing"))) ||
            lowerErrorMessage.includes("authentication failed") ||
            lowerErrorMessage.includes("permission denied") ||
            lowerErrorMessage.includes("quota") || 
            lowerErrorMessage.includes("unauthenticated")) {
            errorMessage = "Gemini API Key is invalid, missing, not authorized, or has exceeded its quota. Please check server configuration.";
        } else if (lowerErrorMessage.includes("model not found") || lowerErrorMessage.includes("invalid model")) {
            errorMessage = `The specified AI model (${MODEL_NAME}) might be unavailable or incorrect. Please check the model name.`;
        }
         else {
            errorMessage = `AI generation failed: ${error.message}`;
        }
    }
    res.status(500).json({ message: errorMessage });
  }
});

// --- Start Server ---
app.listen(port, () => {
  console.log(`Backend server listening at http://localhost:${port}`);
});
