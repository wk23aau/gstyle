// This file simulates a Node.js backend server.
// To run this, you would need to:
// 1. Install dependencies: npm install express @google/genai dotenv
// 2. Ensure you have a .env file with API_KEY="YOUR_GEMINI_API_KEY"

import express from 'express';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
// import mysql from 'mysql2/promise'; // Kept commented

dotenv.config(); // To load API_KEY from .env file

const app = express();
const port = process.env.PORT || 3001; // Backend server port

// --- Middleware ---
app.use(express.json()); // To parse JSON request bodies

// --- Gemini AI Setup ---
const apiKey = process.env.API_KEY;
if (!apiKey) {
  console.error("CRITICAL: API_KEY for Gemini is not set in environment variables. CV generation will fail.");
}
const ai = new GoogleGenAI({ apiKey: apiKey || "FALLBACK_KEY_SERVER_SIDE_IF_ENV_FAILS" });
const MODEL_NAME = 'gemini-1.5-flash-latest';

// --- Simulated User Database ---
// IMPORTANT: This is an in-memory store for simulation ONLY.
// Passwords are NOT hashed. This is NOT secure for production.
let users = [];
let userIdCounter = 1;

// --- Authentication API Routes (Simulated) ---

// Signup
app.post('/api/auth/signup', (req, res) => {
  const { email, password, name } = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({ message: 'Email, password, and name are required for signup.' });
  }
  if (users.find(user => user.email === email)) {
    return res.status(409).json({ message: 'Email already exists.' });
  }

  // IMPORTANT: In a real app, hash the password securely (e.g., using bcrypt)
  // const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = {
    id: userIdCounter++,
    email,
    name,
    password: password, // Storing password directly for simulation - NOT SECURE
  };
  users.push(newUser);

  console.log('User signed up:', { id: newUser.id, email: newUser.email, name: newUser.name });
  console.log('Current users:', users.map(u => ({id: u.id, email: u.email, name: u.name}))); // Log without passwords

  // IMPORTANT: In a real app, generate a proper JWT token
  res.status(201).json({
    user: { id: newUser.id, email: newUser.email, name: newUser.name },
    token: `mock-jwt-token-for-${newUser.id}`, // Mock token
    message: 'Signup successful'
  });
});

// Login
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required for login.' });
  }

  const user = users.find(u => u.email === email);
  if (!user) {
    return res.status(401).json({ message: 'Invalid email or password.' });
  }

  // IMPORTANT: In a real app, compare hashed passwords
  // const isMatch = await bcrypt.compare(password, user.password);
  if (user.password !== password) { // Direct comparison for simulation - NOT SECURE
    return res.status(401).json({ message: 'Invalid email or password.' });
  }
  
  console.log('User logged in:', { id: user.id, email: user.email, name: user.name });

  res.status(200).json({
    user: { id: user.id, email: user.email, name: user.name },
    token: `mock-jwt-token-for-${user.id}`, // Mock token
    message: 'Login successful'
  });
});

// Mock Google Login
app.post('/api/auth/google', (req, res) => {
  const { email } = req.body; // In a real app, this would be a token from Google
  if (!email) {
    return res.status(400).json({ message: 'Email (simulating Google token) is required.' });
  }

  let user = users.find(u => u.email === email);
  if (!user) {
    // Auto-register user for social login simulation
    const name = email.split('@')[0];
    user = {
      id: userIdCounter++,
      email,
      name: name.charAt(0).toUpperCase() + name.slice(1),
      password: `social-mock-${Date.now()}` // Mock password for social users
    };
    users.push(user);
    console.log('User auto-registered via Google mock:', { id: user.id, email: user.email, name: user.name });
    console.log('Current users:', users.map(u => ({id: u.id, email: u.email, name: u.name})));
  } else {
    console.log('User logged in via Google mock:', { id: user.id, email: user.email, name: user.name });
  }
  
  res.status(200).json({
    user: { id: user.id, email: user.email, name: user.name },
    token: `mock-jwt-google-token-for-${user.id}`,
    message: 'Google login successful'
  });
});

// Mock LinkedIn Login
app.post('/api/auth/linkedin', (req, res) => {
  const { email } = req.body; // In a real app, this would be a token from LinkedIn
   if (!email) {
    return res.status(400).json({ message: 'Email (simulating LinkedIn token) is required.' });
  }

  let user = users.find(u => u.email === email);
  if (!user) {
    // Auto-register user for social login simulation
    const name = email.split('@')[0];
    user = {
      id: userIdCounter++,
      email,
      name: name.charAt(0).toUpperCase() + name.slice(1),
      password: `social-mock-${Date.now()}` // Mock password for social users
    };
    users.push(user);
    console.log('User auto-registered via LinkedIn mock:', { id: user.id, email: user.email, name: user.name });
    console.log('Current users:', users.map(u => ({id: u.id, email: u.email, name: u.name})));
  } else {
     console.log('User logged in via LinkedIn mock:', { id: user.id, email: user.email, name: user.name });
  }
  
  res.status(200).json({
    user: { id: user.id, email: user.email, name: user.name },
    token: `mock-jwt-linkedin-token-for-${user.id}`,
    message: 'LinkedIn login successful'
  });
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
