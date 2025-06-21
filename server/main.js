
// This file simulates a Node.js backend server. All code is commented out.
// To run this, you would need to:
// 1. Uncomment the code.
// 2. Install dependencies: npm install express @google/genai mysql2 dotenv
// 3. Ensure you have a .env file with API_KEY="YOUR_GEMINI_API_KEY"
// 4. Set up a MySQL database and update connection details if you uncomment DB logic.

/*
const express = require('express');
const { GoogleGenAI } = require('@google/genai'); // Correct import
const mysql = require('mysql2/promise'); // Using mysql2 for promise-based interaction
require('dotenv').config(); // To load API_KEY from .env file

const app = express();
const port = process.env.PORT || 3001; // Backend server port

// --- Middleware ---
app.use(express.json()); // To parse JSON request bodies

// --- Gemini AI Setup ---
// API key MUST be obtained from process.env.API_KEY
const apiKey = process.env.API_KEY;
if (!apiKey) {
  console.error("CRITICAL: API_KEY for Gemini is not set in environment variables. CV generation will fail.");
  // In a real app, you might prevent the server from starting or handle this more gracefully.
}
// Initialize with named parameter apiKey
const ai = new GoogleGenAI({ apiKey: apiKey || "FALLBACK_KEY_SERVER_SIDE_IF_ENV_FAILS" }); // Fallback only for dev, ensure apiKey is set
const MODEL_NAME = 'gemini-2.5-flash-preview-04-17';

// --- MySQL Database Setup (Simulated) ---
// const dbConfig = {
//   host: process.env.DB_HOST || 'localhost',
//   user: process.env.DB_USER || 'cv_user',
//   password: process.env.DB_PASSWORD || 'cv_password',
//   database: process.env.DB_NAME || 'cv_app_db',
// };

// let dbConnection;

// async function initializeDbConnection() {
//   try {
//     dbConnection = await mysql.createConnection(dbConfig);
//     console.log('Successfully connected to MySQL database.');
//     // You might want to create tables here if they don't exist
//     // await dbConnection.execute(`
//     //   CREATE TABLE IF NOT EXISTS cv_requests (
//     //     id INT AUTO_INCREMENT PRIMARY KEY,
//     //     job_info TEXT,
//     //     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
//     //   );
//     // `);
//   } catch (error) {
//     console.error('Failed to connect to MySQL database:', error);
//     // Handle connection error (e.g., retry, exit)
//   }
// }

// initializeDbConnection(); // Call this when the server starts

// --- API Routes ---
app.post('/api/cv/generate', async (req, res) => {
  const { jobInfo } = req.body;

  if (!jobInfo || typeof jobInfo !== 'string' || !jobInfo.trim()) {
    return res.status(400).json({ message: 'Job information is required and must be a non-empty string.' });
  }

  if (!apiKey) { // Double check here before making an API call
     return res.status(500).json({ message: "Gemini API Key is not configured on the server." });
  }

  // --- Optional: Log request to database (Simulated) ---
  // if (dbConnection) {
  //   try {
  //     // await dbConnection.execute('INSERT INTO cv_requests (job_info) VALUES (?)', [jobInfo]);
  //     // console.log('CV generation request logged to database.');
  //   } catch (dbError) {
  //     // console.error('Failed to log CV request to database:', dbError);
  //     // Continue with CV generation even if logging fails
  //   }
  // }


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
    // Using ai.models.generateContent as per guidelines
    const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: prompt,
        // No specific thinkingConfig, use default for higher quality.
        // No responseMimeType: "application/json" for this simple text outline.
    });
    
    // Using response.text directly
    const textOutput = response.text;

    if (!textOutput) { // Check for null, undefined, or empty string
        console.error('Gemini API returned an empty response.');
        return res.status(500).json({ message: 'Received an empty response from the AI model.' });
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
            lowerErrorMessage.includes("quota") || // Handle quota exceeded errors
            lowerErrorMessage.includes("unauthenticated")) {
            errorMessage = "Gemini API Key is invalid, missing, not authorized, or has exceeded its quota. Please check server configuration.";
        } else {
            errorMessage = `AI generation failed: ${error.message}`;
        }
    }
    res.status(500).json({ message: errorMessage });
  }
});

// --- Serve Static Frontend (Optional - if you build and serve React app from backend) ---
// app.use(express.static(path.join(__dirname, '../dist'))); // Assuming frontend build is in 'dist'
// app.get('*', (req, res) => {
//   res.sendFile(path.join(__dirname, '../dist', 'index.html'));
// });

// --- Start Server ---
// app.listen(port, () => {
//   console.log(`Simulated backend server listening at http://localhost:${port}`);
// });

// --- Graceful Shutdown (Simulated) ---
// process.on('SIGINT', async () => {
//   console.log('SIGINT signal received: closing HTTP server and DB connection');
//   // if (dbConnection) {
//   //   await dbConnection.end();
//   //   console.log('MySQL connection closed.');
//   // }
//   process.exit(0);
// });

*/