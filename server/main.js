// This file implements a Node.js backend server.
// Dependencies: express, @google/genai, dotenv, mysql2, bcrypt, google-auth-library, @google-analytics/data, nodemailer, crypto
// Ensure .env file has API_KEY, DB credentials, GOOGLE_CLIENT_ID, GA_PROPERTY_ID, SMTP settings, FRONTEND_BASE_URL, and GOOGLE_APPLICATION_CREDENTIALS is set.

import express from 'express';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';
import { OAuth2Client } from 'google-auth-library';
import { BetaAnalyticsDataClient } from '@google-analytics/data';
import nodemailer from 'nodemailer';
import crypto from 'crypto';

dotenv.config(); // To load environment variables

const app = express();
const port = process.env.PORT || 3001;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@aicvmaker.com';

// --- Middleware ---
app.use(express.json());

// --- Utility to sanitize user object for API responses ---
const sanitizeUserForResponse = (user) => {
  if (!user) return null;
  // Destructure to remove sensitive fields and return the rest
  const {
    password, // Hashed password from DB
    email_verification_token,
    email_verification_token_expires_at,
    password_reset_token,
    password_reset_token_expires_at,
    ...safeUser // This object will contain all other non-sensitive properties
  } = user;
  return safeUser;
};


// --- Nodemailer Setup ---
const smtpConfig = {
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || "587", 10),
  secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
};

const mailTransporter = nodemailer.createTransport(smtpConfig);

const sendVerificationEmail = async (email, token) => {
  const verificationLink = `${process.env.FRONTEND_BASE_URL || 'http://localhost:5173'}/#/verify-email?token=${token}`;
  const mailOptions = {
    from: `"${process.env.SMTP_FROM_NAME || 'AI CV Maker'}" <${process.env.SMTP_FROM_EMAIL || 'noreply@aicvmaker.com'}>`,
    to: email,
    subject: 'Verify Your Email Address - AI CV Maker',
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>Welcome to AI CV Maker!</h2>
        <p>Please verify your email address to complete your registration and activate your account.</p>
        <p>Click the link below to verify your email:</p>
        <p><a href="${verificationLink}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Verify Email Address</a></p>
        <p>If you did not create an account, no further action is required.</p>
        <p>This link will expire in 24 hours.</p>
        <hr/>
        <p style="font-size: 0.9em; color: #777;">If you're having trouble clicking the button, copy and paste the URL below into your web browser:<br/>${verificationLink}</p>
      </div>
    `,
  };

  try {
    await mailTransporter.sendMail(mailOptions);
    console.log(`Verification email sent to ${email}`);
  } catch (error) {
    console.error(`Error sending verification email to ${email}:`, error);
    throw new Error('Failed to send verification email. Please try again later.');
  }
};

const sendPasswordResetEmail = async (email, token) => {
  const resetLink = `${process.env.FRONTEND_BASE_URL || 'http://localhost:5173'}/#/reset-password?token=${token}`;
  const mailOptions = {
    from: `"${process.env.SMTP_FROM_NAME || 'AI CV Maker'}" <${process.env.SMTP_FROM_EMAIL || 'noreply@aicvmaker.com'}>`,
    to: email,
    subject: 'Password Reset Request - AI CV Maker',
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>Password Reset Request</h2>
        <p>You recently requested to reset your password for your AI CV Maker account.</p>
        <p>Click the link below to reset it:</p>
        <p><a href="${resetLink}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Your Password</a></p>
        <p>If you did not request a password reset, please ignore this email or contact support if you have concerns.</p>
        <p>This link will expire in 1 hour.</p>
        <hr/>
        <p style="font-size: 0.9em; color: #777;">If you're having trouble clicking the button, copy and paste the URL below into your web browser:<br/>${resetLink}</p>
      </div>
    `,
  };
  try {
    await mailTransporter.sendMail(mailOptions);
    console.log(`Password reset email sent to ${email}`);
  } catch (error) {
    console.error(`Error sending password reset email to ${email}:`, error);
    throw new Error('Failed to send password reset email. Please try again later.');
  }
};


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
    // Use placeholder for database name to prevent SQL injection and handle escaping correctly
    await tempConnectionForDbCreation.query('CREATE DATABASE IF NOT EXISTS ??', [dbConfig.database]);
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
          role VARCHAR(50) DEFAULT 'user',
          is_email_verified BOOLEAN DEFAULT FALSE,
          email_verification_token VARCHAR(255) NULL,
          email_verification_token_expires_at TIMESTAMP NULL,
          password_reset_token VARCHAR(255) NULL,
          password_reset_token_expires_at TIMESTAMP NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
      console.log('Users table core structure ensured (with role, verification & password reset fields).');
      
      const columnsToAdd = [
        { name: 'google_id', type: 'VARCHAR(255) UNIQUE' },
        { name: 'role', type: "VARCHAR(50) DEFAULT 'user'" },
        { name: 'is_email_verified', type: 'BOOLEAN DEFAULT FALSE' },
        { name: 'email_verification_token', type: 'VARCHAR(255) NULL' },
        { name: 'email_verification_token_expires_at', type: 'TIMESTAMP NULL' },
        { name: 'password_reset_token', type: 'VARCHAR(255) NULL' },
        { name: 'password_reset_token_expires_at', type: 'TIMESTAMP NULL' },
      ];

      for (const col of columnsToAdd) {
        const [existingCols] = await connection.query(`SHOW COLUMNS FROM users LIKE '${col.name}';`);
        // @ts-ignore
        if (existingCols.length === 0) {
          await connection.query(`ALTER TABLE users ADD COLUMN ${col.name} ${col.type};`);
          console.log(`Added column '${col.name}' to users table.`);
        } else if (col.name === 'role') { // @ts-ignore
            if (!existingCols[0].Default || existingCols[0].Default.toLowerCase() !== "'user'") {
                 await connection.query(`ALTER TABLE users MODIFY COLUMN role ${col.type};`);
                 console.log("Updated role column default."); 
            }
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

// --- AI Setup ---
const aiServiceApiKey = process.env.API_KEY;
if (!aiServiceApiKey) {
  console.error("CRITICAL: API_KEY for the AI service is not set. CV generation will fail.");
}
const ai = new GoogleGenAI({ apiKey: aiServiceApiKey || "FALLBACK_KEY" }); 
const MODEL_NAME = 'gemini-1.5-flash-latest';

// --- Google OAuth Client Setup ---
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
if (!GOOGLE_CLIENT_ID) {
    console.error("CRITICAL: GOOGLE_CLIENT_ID is not set. Google Sign-In will fail.");
}
const googleOAuthClient = new OAuth2Client(GOOGLE_CLIENT_ID);

// --- Google Analytics Data API Setup ---
const GA_PROPERTY_ID = process.env.GA_PROPERTY_ID;
let analyticsDataClient;
if (process.env.GOOGLE_APPLICATION_CREDENTIALS && GA_PROPERTY_ID) {
  try {
    analyticsDataClient = new BetaAnalyticsDataClient();
    console.log("Google Analytics Data API client initialized.");
  } catch (e) { // @ts-ignore
    console.error("Failed to initialize Google Analytics Data API client:", e.message);
  }
} else {
  if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) console.warn("WARNING: GOOGLE_APPLICATION_CREDENTIALS not set. Real-time analytics will be disabled.");
  if (!GA_PROPERTY_ID) console.warn("WARNING: GA_PROPERTY_ID not set. Real-time analytics will be disabled.");
}

// --- Authentication API Routes ---

app.post('/api/auth/signup', async (req, res) => {
  const { email, password, name } = req.body;
  if (!email || !password || !name) return res.status(400).json({ message: 'Email, password, and name are required.' });
  if (password.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters.' });

  try { // @ts-ignore
    const [existingUsers] = await db.query('SELECT id FROM users WHERE email = ?', [email]); // @ts-ignore
    if (existingUsers.length > 0) return res.status(409).json({ message: 'Email already exists. Try logging in.' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const role = email.toLowerCase() === ADMIN_EMAIL.toLowerCase() ? 'admin' : 'user';
    
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(verificationToken).digest('hex');
    const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // @ts-ignore
    const [result] = await db.query(
      'INSERT INTO users (email, password, name, role, email_verification_token, email_verification_token_expires_at, is_email_verified) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [email, hashedPassword, name, role, hashedToken, tokenExpiry, false]
    );
    // @ts-ignore
    const userId = result.insertId;

    await sendVerificationEmail(email, verificationToken);
    
    console.log('User signed up, verification email sent:', { id: userId, email, name, role });
    res.status(201).json({ 
        message: 'Signup successful! Please check your email to verify your account.',
    });

  } catch (error) { // @ts-ignore
    console.error('Email signup error:', error.message); // @ts-ignore
    res.status(500).json({ message: error.message || 'An error occurred during signup.' });
  }
});

app.post('/api/auth/verify-email', async (req, res) => {
    const { token } = req.body;
    if (!token) return res.status(400).json({ message: 'Verification token is required.' });

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    try { // @ts-ignore
        const [users] = await db.query(
            'SELECT * FROM users WHERE email_verification_token = ? AND email_verification_token_expires_at > NOW()', 
            [hashedToken]
        );
        // @ts-ignore
        if (users.length === 0) {
            return res.status(400).json({ message: 'Invalid or expired verification token.' });
        }
        // @ts-ignore
        const user = users[0];

        if (user.is_email_verified) {
            return res.status(400).json({ message: 'Email already verified. You can log in.' });
        }
        // @ts-ignore
        await db.query(
            'UPDATE users SET is_email_verified = TRUE, email_verification_token = NULL, email_verification_token_expires_at = NULL WHERE id = ?',
            [user.id]
        );
        console.log('Email verified for user:', user.email);
        res.status(200).json({ message: 'Email successfully verified. You can now log in.' });
    } catch (error) { // @ts-ignore
        console.error('Email verification error:', error.message); // @ts-ignore
        res.status(500).json({ message: error.message || 'An error occurred during email verification.' });
    }
});


app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'Email and password required.' });
  try { // @ts-ignore
    const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]); // @ts-ignore
    if (users.length === 0) return res.status(401).json({ message: 'Invalid credentials.' }); // @ts-ignore
    let user = users[0];

    if (!user.is_email_verified && !user.google_id) { 
        return res.status(403).json({ message: 'Please verify your email address before logging in. Check your inbox for a verification link.', needsVerification: true, emailForResend: user.email });
    }

    if (!user.password) return res.status(401).json({ message: 'Account may use Google Sign-In or password not set.' });
    if (!await bcrypt.compare(password, user.password)) return res.status(401).json({ message: 'Invalid credentials.' });
    
    if (user.email.toLowerCase() === ADMIN_EMAIL.toLowerCase() && user.role !== 'admin') { // @ts-ignore
      await db.query('UPDATE users SET role = ? WHERE id = ?', ['admin', user.id]); user.role = 'admin'; // Update role in the local user object as well
    }
    
    res.status(200).json({ 
        user: sanitizeUserForResponse(user), 
        token: `mock-jwt-token-for-${user.id}`, 
        message: 'Login successful' 
    });
  } catch (error) { // @ts-ignore
      console.error('Login error:', error.message); // @ts-ignore
      res.status(500).json({ message: error.message ||'Login error.' });
  }
});

app.post('/api/auth/resend-verification-email', async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required.' });

    try { // @ts-ignore
        const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]); // @ts-ignore
        if (users.length === 0) return res.status(404).json({ message: 'User with this email not found.' }); // @ts-ignore
        const user = users[0];

        if (user.is_email_verified) return res.status(400).json({ message: 'This email address is already verified.' });

        const verificationToken = crypto.randomBytes(32).toString('hex');
        const hashedToken = crypto.createHash('sha256').update(verificationToken).digest('hex');
        const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
        // @ts-ignore
        await db.query(
            'UPDATE users SET email_verification_token = ?, email_verification_token_expires_at = ? WHERE id = ?',
            [hashedToken, tokenExpiry, user.id]
        );
        await sendVerificationEmail(user.email, verificationToken);
        console.log('Resent verification email to:', user.email);
        res.status(200).json({ message: 'A new verification email has been sent. Please check your inbox.' });
    } catch (error) { // @ts-ignore
        console.error('Resend verification email error:', error.message); // @ts-ignore
        res.status(500).json({ message: error.message || 'Failed to resend verification email.' });
    }
});

app.post('/api/auth/request-password-reset', async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required.' });

    try { // @ts-ignore
        const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]); // @ts-ignore
        if (users.length > 0) { // @ts-ignore
            const user = users[0];
            if (!user.is_email_verified) {
                // Don't reveal if email exists but isn't verified, for security.
                // Just send the generic message.
                console.log(`Password reset requested for unverified email: ${email}`);
            } else {
                const resetToken = crypto.randomBytes(32).toString('hex');
                const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
                const tokenExpiry = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hour
                // @ts-ignore
                await db.query(
                    'UPDATE users SET password_reset_token = ?, password_reset_token_expires_at = ? WHERE id = ?',
                    [hashedToken, tokenExpiry, user.id]
                );
                await sendPasswordResetEmail(user.email, resetToken);
                console.log(`Password reset email sent to verified user: ${email}`);
            }
        } else {
            console.log(`Password reset requested for non-existent email: ${email}`);
        }
        // Always send a generic message to prevent email enumeration
        res.status(200).json({ message: 'If an account with this email exists and is verified, a password reset link has been sent.' });
    } catch (error) { // @ts-ignore
        console.error('Request password reset error:', error.message);
        res.status(500).json({ message: 'An error occurred while processing your request.' });
    }
});

app.post('/api/auth/reset-password', async (req, res) => {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) return res.status(400).json({ message: 'Token and new password are required.' });
    if (newPassword.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters.' });

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    try { // @ts-ignore
        const [users] = await db.query(
            'SELECT * FROM users WHERE password_reset_token = ? AND password_reset_token_expires_at > NOW()',
            [hashedToken]
        );
        // @ts-ignore
        if (users.length === 0) {
            return res.status(400).json({ message: 'Invalid or expired password reset token.' });
        }
        // @ts-ignore
        const user = users[0];
        const hashedNewPassword = await bcrypt.hash(newPassword, 10);
        // @ts-ignore
        await db.query(
            'UPDATE users SET password = ?, password_reset_token = NULL, password_reset_token_expires_at = NULL WHERE id = ?',
            [hashedNewPassword, user.id]
        );
        console.log('Password reset successfully for user:', user.email);
        res.status(200).json({ message: 'Password has been reset successfully. You can now log in with your new password.' });
    } catch (error) { // @ts-ignore
        console.error('Reset password error:', error.message);
        res.status(500).json({ message: 'An error occurred while resetting your password.' });
    }
});


app.post('/api/auth/google-signin', async (req, res) => {
  const { idToken } = req.body;
  if (!idToken) return res.status(400).json({ message: 'ID Token required.' });
  if (!GOOGLE_CLIENT_ID) return res.status(500).json({ message: 'Google Sign-In not configured on server.' });
  try {
    const ticket = await googleOAuthClient.verifyIdToken({ idToken, audience: GOOGLE_CLIENT_ID });
    const payload = ticket.getPayload();
    if (!payload || !payload.email || !payload.sub) return res.status(400).json({ message: 'Invalid token payload.' });
    const { email, name: googleName, sub: googleId } = payload;
    const userEmail = payload.email_verified ? email : null;
    if (!userEmail) return res.status(400).json({ message: 'Google email not verified.' });
    
    const assignedRole = userEmail.toLowerCase() === ADMIN_EMAIL.toLowerCase() ? 'admin' : 'user';
    // @ts-ignore
    let [usersFromDb] = await db.query('SELECT * FROM users WHERE google_id = ? OR email = ?', [googleId, userEmail]);
    // @ts-ignore
    let user = usersFromDb[0];

    if (user) { 
      let roleToUpdate = user.role;
      if (user.email.toLowerCase() === ADMIN_EMAIL.toLowerCase() && user.role !== 'admin') roleToUpdate = 'admin';
      
      let fieldsToUpdate = ['is_email_verified = TRUE']; 
      let valuesToUpdate = [];

      if (!user.google_id && user.email === userEmail) { fieldsToUpdate.push('google_id = ?'); valuesToUpdate.push(googleId); }
      if (roleToUpdate !== user.role) { fieldsToUpdate.push('role = ?'); valuesToUpdate.push(roleToUpdate); }
      if (googleName && user.name !== googleName) { fieldsToUpdate.push('name = ?'); valuesToUpdate.push(googleName); }
      
      if (fieldsToUpdate.length > 0) { // @ts-ignore
        await db.query(`UPDATE users SET ${fieldsToUpdate.join(', ')} WHERE id = ?`, [...valuesToUpdate, user.id]); // @ts-ignore
        const [refetchedUser] = await db.query('SELECT * FROM users WHERE id = ?', [user.id]); user = refetchedUser[0]; 
      }
    } else { 
      // @ts-ignore
      const [result] = await db.query(
        'INSERT INTO users (email, name, google_id, role, is_email_verified) VALUES (?, ?, ?, ?, TRUE)',
        [userEmail, googleName || userEmail.split('@')[0], googleId, assignedRole]
      ); // @ts-ignore
      user = { id: result.insertId, email: userEmail, name: googleName || userEmail.split('@')[0], google_id: googleId, role: assignedRole, is_email_verified: true, created_at: new Date() }; // Add created_at for consistency if needed
    }
    
    res.status(200).json({ 
        user: sanitizeUserForResponse(user), 
        token: `mock-jwt-google-token-for-${user.id}`, 
        message: 'Google Sign-In successful' 
    });
  } catch (error) { // @ts-ignore
    if (error.message?.includes("Token used too late") || error.message?.includes("Invalid token signature")) return res.status(401).json({ message: 'Google token invalid/expired.' }); // @ts-ignore
    if (error.code === 'ER_BAD_FIELD_ERROR' || error.sqlMessage?.includes("Unknown column")) return res.status(500).json({message: "DB schema error."}); // @ts-ignore
    console.error('Google Sign-In error:', error.message); // @ts-ignore
    res.status(500).json({ message: error.message || 'Google Sign-In error.' });
  }
});

// --- CV Generation API Route ---
app.post('/api/cv/generate', async (req, res) => {
  const { jobInfo } = req.body;
  if (!jobInfo || typeof jobInfo !== 'string' || !jobInfo.trim()) return res.status(400).json({ message: 'Job info required.' });
  if (!aiServiceApiKey) return res.status(500).json({ message: "AI Service API Key not configured on the server." });
  
  const prompt = `You are an expert CV writer... (prompt truncated for brevity) Job Information: --- ${jobInfo} --- CV Outline:`;
  try {
    if (!ai.models || typeof ai.models.generateContent !== 'function') return res.status(500).json({ message: 'Server AI configuration error.' });
    
    const result = await ai.models.generateContent({ model: MODEL_NAME, contents: prompt });
    const textOutput = result.text;
    
    if (!textOutput?.trim()) return res.status(500).json({ message: 'Received an empty or invalid response from the AI model.' });
    res.json({ cvContent: textOutput });

  } catch (error) { // @ts-ignore
    console.error('Error generating CV content with AI service:', error.message); // @ts-ignore
    let errMsg = `AI generation failed: ${error.message || 'Unknown error'}`; // @ts-ignore
    const lowerMsg = error.message?.toLowerCase();
    
    if (lowerMsg?.includes("api key not valid") || lowerMsg?.includes("unauthenticated") || lowerMsg?.includes("permission denied") || lowerMsg?.includes("quota")) {
      errMsg = "There is an issue with the AI service configuration. Please contact support.";
    } else if (lowerMsg?.includes("model not found") || lowerMsg?.includes("invalid model")) {
      errMsg = "The configured AI model is currently unavailable. Please try again later or contact support.";
    }
    res.status(500).json({ message: errMsg });
  }
});

// --- Real-time Analytics API Route ---
app.get('/api/analytics/realtime-data', async (req, res) => {
  if (!analyticsDataClient || !GA_PROPERTY_ID) {
    return res.status(503).json({ 
      message: 'Real-time analytics service is not configured or unavailable.',
      activeUsers: 0,
      topPages: []
    });
  }
  try {
    const [realtimeReport] = await analyticsDataClient.runRealtimeReport({
      property: `properties/${GA_PROPERTY_ID}`,
      metrics: [{ name: 'activeUsers' }],
      dimensions: [{ name: 'unifiedScreenName' }], 
      metricAggregations: ['TOTAL'],
      limit: 5, 
    });
    let activeUsers = 0; // @ts-ignore
    if (realtimeReport.totals?.[0]?.metricValues?.[0]?.value) activeUsers = parseInt(realtimeReport.totals[0].metricValues[0].value); // @ts-ignore
    const topPages = realtimeReport.rows?.map(row => ({ name: row.dimensionValues?.[0]?.value || 'Unknown Page', users: parseInt(row.metricValues?.[0]?.value || "0") })) || [];
    res.json({ activeUsers, topPages });
  } catch (error) { // @ts-ignore
    console.error('Error fetching real-time analytics from GA Data API:', error.message); // @ts-ignore
    let errorMessage = `Failed to fetch real-time analytics: ${error.message || 'Unknown GA API Error'}`; // @ts-ignore
    if (error.code === 7 || error.message?.includes('Service account does not have permission')) errorMessage = 'Service account does not have permission to access the GA property.'; // @ts-ignore
    else if (error.message?.includes('property_not_found')) errorMessage = `GA Property ID '${GA_PROPERTY_ID}' not found.`;
    res.status(500).json({ message: errorMessage, activeUsers: 0, topPages: [] });
  }
});

// --- Start Server ---
app.listen(port, () => {
  console.log(`Backend server listening at http://localhost:${port}`);
});
