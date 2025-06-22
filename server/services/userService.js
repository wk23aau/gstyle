
import { dbPool, DEFAULT_CREDITS_REGISTERED } from '../config/database.js';
import bcrypt from 'bcrypt';
import { generateToken, hashToken } from '../utils/tokenUtils.js';

// Custom Error for User Service
class UserServiceError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
  }
}

const GEMINI_CALL_COST = 5; // Define cost per call

// Helper to get today's date in YYYY-MM-DD format
const getTodayDateString = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// --- User Finder Functions ---
export const findUserByEmail = async (email) => {
  if (!dbPool) throw new UserServiceError('Database not initialized.', 503);
  const [users] = await dbPool.query('SELECT *, DATE_FORMAT(credits_last_reset_date, "%Y-%m-%d") as credits_last_reset_date FROM users WHERE email = ?', [email]);
  return users[0] || null;
};

export const findUserById = async (id) => {
  if (!dbPool) throw new UserServiceError('Database not initialized.', 503);
  const [users] = await dbPool.query('SELECT *, DATE_FORMAT(credits_last_reset_date, "%Y-%m-%d") as credits_last_reset_date FROM users WHERE id = ?', [id]);
  return users[0] || null;
};

export const findUserByGoogleId = async (googleId) => {
  if (!dbPool) throw new UserServiceError('Database not initialized.', 503);
  const [users] = await dbPool.query('SELECT *, DATE_FORMAT(credits_last_reset_date, "%Y-%m-%d") as credits_last_reset_date FROM users WHERE google_id = ?', [googleId]);
  return users[0] || null;
};

// --- User Creation and Update Functions ---
export const createUserWithEmailPassword = async (email, password, name, role) => {
  if (!dbPool) throw new UserServiceError('Database not initialized.', 503);
  const hashedPassword = await bcrypt.hash(password, 10);
  
  const rawToken = generateToken();
  const verificationHashedToken = hashToken(rawToken);
  const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
  const todayDate = getTodayDateString();

  const [result] = await dbPool.query(
    'INSERT INTO users (email, password, name, role, email_verification_token, email_verification_token_expires_at, is_email_verified, credits_available, credits_last_reset_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [email, hashedPassword, name, role, verificationHashedToken, tokenExpiry, false, DEFAULT_CREDITS_REGISTERED, todayDate]
  );
  return { userId: result.insertId, verificationToken: rawToken }; 
};

export const createOrUpdateUserWithGoogle = async (email, googleName, googleId, role) => {
  if (!dbPool) throw new UserServiceError('Database not initialized.', 503);
  let [usersFromDb] = await dbPool.query('SELECT *, DATE_FORMAT(credits_last_reset_date, "%Y-%m-%d") as credits_last_reset_date FROM users WHERE google_id = ? OR email = ?', [googleId, email]);
  let user = usersFromDb[0];
  const todayDate = getTodayDateString();

  if (user) { 
    let fieldsToUpdate = [];
    let valuesToUpdate = [];

    if (!user.google_id && user.email === email) { fieldsToUpdate.push('google_id = ?'); valuesToUpdate.push(googleId); }
    if (role !== user.role) { fieldsToUpdate.push('role = ?'); valuesToUpdate.push(role); }
    if (googleName && user.name !== googleName) { fieldsToUpdate.push('name = ?'); valuesToUpdate.push(googleName); }
    if (!user.is_email_verified) { fieldsToUpdate.push('is_email_verified = TRUE');} 
    if (user.credits_available === null) { fieldsToUpdate.push('credits_available = ?'); valuesToUpdate.push(DEFAULT_CREDITS_REGISTERED); }
    if (user.credits_last_reset_date === null) { fieldsToUpdate.push('credits_last_reset_date = ?'); valuesToUpdate.push(todayDate); }


    if (fieldsToUpdate.length > 0) {
      await dbPool.query(`UPDATE users SET ${fieldsToUpdate.join(', ')} WHERE id = ?`, [...valuesToUpdate, user.id]);
      const [refetchedUser] = await dbPool.query('SELECT *, DATE_FORMAT(credits_last_reset_date, "%Y-%m-%d") as credits_last_reset_date FROM users WHERE id = ?', [user.id]);
      user = refetchedUser[0];
    }
  } else { 
    const [result] = await dbPool.query(
      'INSERT INTO users (email, name, google_id, role, is_email_verified, password, credits_available, credits_last_reset_date) VALUES (?, ?, ?, ?, TRUE, NULL, ?, ?)',
      [email, googleName || email.split('@')[0], googleId, role, DEFAULT_CREDITS_REGISTERED, todayDate]
    );
    user = { 
        id: result.insertId, email, name: googleName || email.split('@')[0], 
        google_id: googleId, role, is_email_verified: true, password: null,
        credits_available: DEFAULT_CREDITS_REGISTERED, credits_last_reset_date: todayDate,
    };
  }
  return user;
};


// --- Email Verification Functions ---
export const findUserByVerificationToken = async (hashedToken) => {
  if (!dbPool) throw new UserServiceError('Database not initialized.', 503);
  const [users] = await dbPool.query(
      'SELECT *, DATE_FORMAT(credits_last_reset_date, "%Y-%m-%d") as credits_last_reset_date FROM users WHERE email_verification_token = ? AND email_verification_token_expires_at > NOW()', 
      [hashedToken]
  );
  return users[0] || null;
};

export const verifyUserEmailInDb = async (userId) => {
  if (!dbPool) throw new UserServiceError('Database not initialized.', 503);
  await dbPool.query(
      'UPDATE users SET is_email_verified = TRUE, email_verification_token = NULL, email_verification_token_expires_at = NULL WHERE id = ?',
      [userId]
  );
};

export const updateUserVerificationToken = async (userId) => {
  if (!dbPool) throw new UserServiceError('Database not initialized.', 503);
  const rawToken = generateToken();
  const hashedToken = hashToken(rawToken);
  const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
  await dbPool.query(
      'UPDATE users SET email_verification_token = ?, email_verification_token_expires_at = ? WHERE id = ?',
      [hashedToken, tokenExpiry, userId]
  );
  return rawToken; 
};

// --- Password Reset Functions ---
export const setPasswordResetTokenForUser = async (userId) => {
  if (!dbPool) throw new UserServiceError('Database not initialized.', 503);
  const rawToken = generateToken();
  const hashedToken = hashToken(rawToken);
  const tokenExpiry = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hour
  await dbPool.query(
       'UPDATE users SET password_reset_token = ?, password_reset_token_expires_at = ? WHERE id = ?',
       [hashedToken, tokenExpiry, userId]
  );
  return rawToken; 
};

export const findUserByPasswordResetToken = async (hashedToken) => {
  if (!dbPool) throw new UserServiceError('Database not initialized.', 503);
  const [users] = await dbPool.query(
      'SELECT *, DATE_FORMAT(credits_last_reset_date, "%Y-%m-%d") as credits_last_reset_date FROM users WHERE password_reset_token = ? AND password_reset_token_expires_at > NOW()',
      [hashedToken]
  );
  return users[0] || null;
};

export const updateUserPassword = async (userId, newPassword) => {
  if (!dbPool) throw new UserServiceError('Database not initialized.', 503);
  const hashedNewPassword = await bcrypt.hash(newPassword, 10);
  await dbPool.query(
      'UPDATE users SET password = ?, password_reset_token = NULL, password_reset_token_expires_at = NULL WHERE id = ?',
      [hashedNewPassword, userId]
  );
};

export const updateUserRoleIfAdmin = async (userId, email, currentRole) => {
    if (!dbPool) throw new UserServiceError('Database not initialized.', 503);
    const ADMIN_EMAIL_INTERNAL = process.env.ADMIN_EMAIL || 'admin@aicvmaker.com';
    if (email.toLowerCase() === ADMIN_EMAIL_INTERNAL.toLowerCase() && currentRole !== 'admin') {
        await dbPool.query('UPDATE users SET role = ? WHERE id = ?', ['admin', userId]);
        return 'admin'; 
    }
    return currentRole; 
};


// --- Credit Management Functions ---
export const initializeAndResetUserCreditsIfNeeded = async (user) => {
  if (!dbPool) throw new UserServiceError('Database not initialized.', 503);
  
  let creditsAvailable = user.credits_available;
  let creditsLastResetDate = user.credits_last_reset_date;
  const todayDate = getTodayDateString();
  let updatedInDb = false;

  if (creditsAvailable === null || creditsAvailable === undefined) {
    creditsAvailable = DEFAULT_CREDITS_REGISTERED;
    if (creditsLastResetDate === null || creditsLastResetDate === undefined) {
      creditsLastResetDate = todayDate;
    }
    await dbPool.query(
      'UPDATE users SET credits_available = ?, credits_last_reset_date = ? WHERE id = ?',
      [creditsAvailable, creditsLastResetDate, user.id]
    );
    updatedInDb = true;
    console.log(`Initialized credits for user ID ${user.id} to ${creditsAvailable} for date ${creditsLastResetDate}`);
  } else if (creditsLastResetDate !== todayDate) {
    creditsAvailable = DEFAULT_CREDITS_REGISTERED;
    creditsLastResetDate = todayDate;
    await dbPool.query(
      'UPDATE users SET credits_available = ?, credits_last_reset_date = ? WHERE id = ?',
      [creditsAvailable, creditsLastResetDate, user.id]
    );
    updatedInDb = true;
    console.log(`Reset credits for user ID ${user.id} to ${creditsAvailable} for new day ${creditsLastResetDate}`);
  }
  
  return { 
    ...user, 
    credits_available: creditsAvailable, 
    credits_last_reset_date: creditsLastResetDate,
    _updatedInDb: updatedInDb // Internal flag to know if a refresh is needed from caller
  };
};

export const checkAndDecrementUserCredits = async (userId, cost = GEMINI_CALL_COST) => {
  if (!dbPool) throw new UserServiceError('Database not initialized.', 503);
  if (!userId) throw new UserServiceError('User ID is required to check credits.', 400);

  let user = await findUserById(userId);
  if (!user) throw new UserServiceError('User not found.', 404);

  // Initialize/reset credits if needed
  const updatedUserFromReset = await initializeAndResetUserCreditsIfNeeded(user);
  user = { ...user, ...updatedUserFromReset }; // Merge updates

  if (user.credits_available < cost) {
    throw new UserServiceError(`Insufficient credits. You have ${user.credits_available} but need ${cost}. Please try again tomorrow or contact support.`, 403);
  }

  const newCredits = user.credits_available - cost;
  await dbPool.query(
    'UPDATE users SET credits_available = ? WHERE id = ?',
    [newCredits, userId]
  );
  console.log(`Decremented credits for user ID ${userId} by ${cost}. New balance: ${newCredits}`);
  
  // Return the updated user object or just the new credit status
  return { 
    ...user, 
    credits_available: newCredits 
  };
};
