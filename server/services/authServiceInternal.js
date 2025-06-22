
import bcrypt from 'bcrypt';
import { OAuth2Client } from 'google-auth-library';
import { 
    findUserByEmail, 
    findUserById,
    createUserWithEmailPassword, 
    createOrUpdateUserWithGoogle,
    findUserByVerificationToken, 
    verifyUserEmailInDb,
    updateUserVerificationToken,
    setPasswordResetTokenForUser,
    findUserByPasswordResetToken,
    updateUserPassword,
    updateUserRoleIfAdmin,
    initializeAndResetUserCreditsIfNeeded // Import new credit function
} from './userService.js';
import { sendVerificationEmail, sendPasswordResetEmail } from './emailService.js';
import { sanitizeUserForResponse } from '../utils/sanitizeUser.js';
import { hashToken } from '../utils/tokenUtils.js';
import { ADMIN_EMAIL, GOOGLE_CLIENT_ID } from '../config/appConfig.js';


const googleOAuthClient = GOOGLE_CLIENT_ID ? new OAuth2Client(GOOGLE_CLIENT_ID) : null;
if (!googleOAuthClient) {
    console.error("AuthServiceInternal: Google OAuth Client not initialized due to missing GOOGLE_CLIENT_ID.");
}

// Custom Error for Auth Service
class AuthServiceError extends Error {
  constructor(message, statusCode = 500, details = null) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.details = details; 
  }
}

export const signupUser = async (email, password, name) => {
  if (!email || !password || !name) {
    throw new AuthServiceError('Email, password, and name are required.', 400);
  }
  if (password.length < 6) {
    throw new AuthServiceError('Password must be at least 6 characters.', 400);
  }

  const existingUser = await findUserByEmail(email);
  if (existingUser) {
    throw new AuthServiceError('Email already exists. Try logging in.', 409);
  }

  const role = email.toLowerCase() === ADMIN_EMAIL.toLowerCase() ? 'admin' : 'user';
  const { userId, verificationToken } = await createUserWithEmailPassword(email, password, name, role);
  
  await sendVerificationEmail(email, verificationToken);
  
  console.log('User signed up, verification email sent:', { id: userId, email, name, role });
  return { 
      message: 'Signup successful! Please check your email to verify your account.',
  };
};

export const verifyUserEmail = async (token) => {
    if (!token) throw new AuthServiceError('Verification token is required.', 400);
    const hashedToken = hashToken(token);
    const user = await findUserByVerificationToken(hashedToken);

    if (!user) throw new AuthServiceError('Invalid or expired verification token.', 400);
    if (user.is_email_verified) throw new AuthServiceError('Email already verified. You can log in.', 400);

    await verifyUserEmailInDb(user.id);
    console.log('Email verified for user:', user.email);
    return { message: 'Email successfully verified. You can now log in.' };
};

export const loginUser = async (email, password) => {
    if (!email || !password) throw new AuthServiceError('Email and password required.', 400);

    let user = await findUserByEmail(email);
    if (!user) throw new AuthServiceError('Invalid credentials. Please check your email and password.', 401);

    if (user.google_id && !user.password) {
        const error = new AuthServiceError("It looks like you originally signed up using Google. Please use the 'Sign in with Google' button. If you'd like to set a password for email login, please use the 'Forgot Password?' option.", 401);
        // @ts-ignore
        error.useGoogleSignIn = true;
        throw error;
    }

    if (!user.is_email_verified && !user.google_id) {
        const error = new AuthServiceError('Please verify your email address before logging in. Check your inbox for a verification link.', 403);
        // @ts-ignore
        error.needsVerification = true; // @ts-ignore
        error.emailForResend = user.email;
        throw error;
    }

    if (!user.password) { 
         throw new AuthServiceError('Password not set for this account. Try the "Forgot Password?" option or contact support.', 401);
    }
    
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
        throw new AuthServiceError('Invalid credentials. Please check your email and password.', 401);
    }
    
    const updatedRole = await updateUserRoleIfAdmin(user.id, user.email, user.role);
    if (updatedRole !== user.role) user.role = updatedRole; 

    // Initialize/reset credits if needed
    user = await initializeAndResetUserCreditsIfNeeded(user);
    
    return { 
        user: sanitizeUserForResponse(user),
        token: `mock-jwt-token-for-${user.id}`, 
        message: 'Login successful' 
    };
};

export const resendVerificationEmail = async (email) => {
    if (!email) throw new AuthServiceError('Email is required.', 400);
    const user = await findUserByEmail(email);
    if (!user) throw new AuthServiceError('User with this email not found.', 404);
    if (user.is_email_verified) throw new AuthServiceError('This email address is already verified.', 400);

    const newVerificationToken = await updateUserVerificationToken(user.id);
    await sendVerificationEmail(user.email, newVerificationToken);
    console.log('Resent verification email to:', user.email);
    return { message: 'A new verification email has been sent. Please check your inbox.' };
};

export const requestPasswordResetLink = async (email) => {
    if (!email) throw new AuthServiceError('Email is required.', 400);
    const user = await findUserByEmail(email);

    if (user && (user.is_email_verified || user.google_id)) {
        const resetToken = await setPasswordResetTokenForUser(user.id);
        await sendPasswordResetEmail(user.email, resetToken);
        console.log(`Password reset/set email sent to: ${email}`);
    } else if (user) {
        console.log(`Password reset requested for unverified, non-Google email: ${email}. No email sent.`);
    } else {
        console.log(`Password reset requested for non-existent email: ${email}. No email sent.`);
    }
    return { message: 'If your email address is registered (and verified, or linked to Google), you will receive a password reset link. Please check your inbox.' };
};

export const resetUserPassword = async (token, newPassword) => {
    if (!token || !newPassword) throw new AuthServiceError('Token and new password are required.', 400);
    if (newPassword.length < 6) throw new AuthServiceError('Password must be at least 6 characters.', 400);

    const hashedToken = hashToken(token);
    const user = await findUserByPasswordResetToken(hashedToken);
    if (!user) throw new AuthServiceError('Invalid or expired password reset token.', 400);
    
    await updateUserPassword(user.id, newPassword);
    console.log('Password reset successfully for user:', user.email);
    return { message: 'Password has been reset successfully. You can now log in with your new password.' };
};

export const handleGoogleSignIn = async (idToken) => {
    if (!idToken) throw new AuthServiceError('ID Token required.', 400);
    if (!googleOAuthClient) throw new AuthServiceError('Google Sign-In not configured on server (OAuth client missing).', 503);

    try {
        const ticket = await googleOAuthClient.verifyIdToken({ idToken, audience: GOOGLE_CLIENT_ID });
        const payload = ticket.getPayload();
        if (!payload || !payload.email || !payload.sub) throw new AuthServiceError('Invalid Google token payload.', 400);
        
        const { email, name: googleName, sub: googleId } = payload;
        const userEmail = payload.email_verified ? email : null;
        if (!userEmail) throw new AuthServiceError('Google email not verified by Google.', 400);
        
        const assignedRole = userEmail.toLowerCase() === ADMIN_EMAIL.toLowerCase() ? 'admin' : 'user';
        let user = await createOrUpdateUserWithGoogle(userEmail, googleName, googleId, assignedRole);
        
        // Initialize/reset credits if needed
        user = await initializeAndResetUserCreditsIfNeeded(user);

        return { 
            user: sanitizeUserForResponse(user),
            token: `mock-jwt-google-token-for-${user.id}`, 
            message: 'Google Sign-In successful' 
        };
    } catch (error) {
        if (error.message?.includes("Token used too late") || error.message?.includes("Invalid token signature") || error.message?.includes("token has expired")) {
            throw new AuthServiceError('Google token invalid/expired.', 401);
        }
        console.error('Google Sign-In service error:', error.message);
        throw new AuthServiceError(error.message || 'An unexpected error occurred during Google Sign-In.', 500);
    }
};

export const changeUserPassword = async (userId, currentPassword, newPassword) => {
    if (!userId || !currentPassword || !newPassword) {
        throw new AuthServiceError('User ID, current password, and new password are required.', 400);
    }
    if (newPassword.length < 6) {
        throw new AuthServiceError('New password must be at least 6 characters long.', 400);
    }

    const user = await findUserById(userId);
    if (!user) throw new AuthServiceError('User not found.', 404);

    if (!user.password) {
        throw new AuthServiceError('No local password set for this account. If you signed up with Google, use "Forgot Password?" to set a password first.', 400);
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) throw new AuthServiceError('Incorrect current password.', 401);

    await updateUserPassword(user.id, newPassword); 
    console.log(`Password changed successfully for user ID: ${userId}`);
    return { message: 'Password changed successfully.' };
};
