// This file simulates a Node.js backend server.
// To run this, you would need to:
// 1. Install dependencies: npm install express @google/genai dotenv
// 2. Ensure you have a .env file with API_KEY="YOUR_GEMINI_API_KEY"

import express from 'express';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';

dotenv.config(); // To load API_KEY from .env file

const app = express();
const port = process.env.PORT || 3001; // Backend server port

// --- Middleware ---
app.use(express.json()); // To parse JSON request bodies

// --- MySQL Database Setup ---
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'aicvmakeroauth',
};

let db;

async function initializeDatabase() {
  try {
    // Create database if it doesn't exist
    const tempConnection = await mysql.createConnection({
      host: dbConfig.host,
      user: dbConfig.user,
      password: dbConfig.password,
    });
    await tempConnection.query(`CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\`;`);
    await tempConnection.end();

    // Connect to the database
    db = await mysql.createPool(dbConfig);

    // Create users table if it doesn't exist
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Connected to MySQL database and users table is ready.');
  } catch (error) {
    console.error('Failed to initialize database:', error);
    // Exit the process if DB connection fails, as it's critical for auth
    process.exit(1);
  }
}

initializeDatabase();


// --- Gemini AI Setup ---
const apiKey = process.env.API_KEY;
if (!apiKey) {
  console.error("CRITICAL: API_KEY for Gemini is not set in environment variables. CV generation will fail.");
}
const ai = new GoogleGenAI({ apiKey: apiKey || "FALLBACK_KEY_SERVER_SIDE_IF_ENV_FAILS" });
const MODEL_NAME = 'gemini-1.5-flash-latest';


// --- Authentication API Routes ---

// Signup
app.post('/api/auth/signup', async (req, res) => {
  const { email, password, name } = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({ message: 'Email, password, and name are required for signup.' });
  }

  try {
    // Check if user already exists
    const [existingUsers] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    // @ts-ignore
    if (existingUsers.length > 0) {
      return res.status(409).json({ message: 'Email already exists.' });
    }

    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Insert new user
    const [result] = await db.query(
      'INSERT INTO users (email, password, name) VALUES (?, ?, ?)',
      [email, hashedPassword, name]
    );
    // @ts-ignore
    const insertId = result.insertId;

    console.log('User signed up:', { id: insertId, email, name });

    res.status(201).json({
      user: { id: insertId, email, name },
      token: `mock-jwt-token-for-${insertId}`, // Mock token
      message: 'Signup successful'
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'An error occurred during signup.' });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required for login.' });
  }

  try {
    // Retrieve user by email
    const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    // @ts-ignore
    if (users.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }
    // @ts-ignore
    const user = users[0];

    // Compare hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    console.log('User logged in:', { id: user.id, email: user.email, name: user.name });

    res.status(200).json({
      user: { id: user.id, email: user.email, name: user.name },
      token: `mock-jwt-token-for-${user.id}`, // Mock token
      message: 'Login successful'
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'An error occurred during login.' });
  }
});

// Mock Google Login
app.post('/api/auth/google', async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ message: 'Email (simulating Google token) is required.' });
  }

  try {
    let user;
    const [existingUsers] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    // @ts-ignore
    if (existingUsers.length > 0) {
      // @ts-ignore
      user = existingUsers[0];
      console.log('User logged in via Google mock:', { id: user.id, email: user.email, name: user.name });
    } else {
      // Auto-register user for social login simulation
      const name = email.split('@')[0];
      const formattedName = name.charAt(0).toUpperCase() + name.slice(1);
      // For social logins, we might store a placeholder or no password,
      // or a securely generated random one if our schema requires it.
      // Here, we'll use a very long, random, and pre-hashed string as a placeholder.
      const placeholderPassword = await bcrypt.hash(`social-mock-${Date.now()}-${Math.random()}`, 10);

      const [result] = await db.query(
        'INSERT INTO users (email, password, name) VALUES (?, ?, ?)',
        [email, placeholderPassword, formattedName]
      );
      // @ts-ignore
      const insertId = result.insertId;
      user = { id: insertId, email, name: formattedName };
      console.log('User auto-registered via Google mock:', { id: user.id, email: user.email, name: user.name });
    }

    res.status(200).json({
      user: { id: user.id, email: user.email, name: user.name },
      token: `mock-jwt-google-token-for-${user.id}`,
      message: 'Google login successful'
    });
  } catch (error) {
    console.error('Google login error:', error);
    res.status(500).json({ message: 'An error occurred during Google login.' });
  }
});

// Mock LinkedIn Login
app.post('/api/auth/linkedin', async (req, res) => {
  const { email } = req.body;
   if (!email) {
    return res.status(400).json({ message: 'Email (simulating LinkedIn token) is required.' });
  }

  try {
    let user;
    const [existingUsers] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    // @ts-ignore
    if (existingUsers.length > 0) {
      // @ts-ignore
      user = existingUsers[0];
      console.log('User logged in via LinkedIn mock:', { id: user.id, email: user.email, name: user.name });
    } else {
      // Auto-register user for social login simulation
      const name = email.split('@')[0];
      const formattedName = name.charAt(0).toUpperCase() + name.slice(1);
      const placeholderPassword = await bcrypt.hash(`social-mock-${Date.now()}-${Math.random()}`, 10);

      const [result] = await db.query(
        'INSERT INTO users (email, password, name) VALUES (?, ?, ?)',
        [email, placeholderPassword, formattedName]
      );
      // @ts-ignore
      const insertId = result.insertId;
      user = { id: insertId, email, name: formattedName };
      console.log('User auto-registered via LinkedIn mock:', { id: user.id, email: user.email, name: user.name });
    }

    res.status(200).json({
      user: { id: user.id, email: user.email, name: user.name },
      token: `mock-jwt-linkedin-token-for-${user.id}`,
      message: 'LinkedIn login successful'
    });
  } catch (error) {
    console.error('LinkedIn login error:', error);
    res.status(500).json({ message: 'An error occurred during LinkedIn login.' });
  }
});


// --- CV Generation API Route ---
app.post('/api/cv/generate', async (req, res) => {
  const { jobInfo } = req.body;

  if (!jobInfo || typeof jobInfo !== 'string' || !jobInfo.trim()) {
    return res.status(400).json({ message: 'Job information is required and must be a non-empty string.' });
  }

  if (!apiKey) {
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
  console.log(`Simulated backend server listening at http://localhost:${port}`);
});
