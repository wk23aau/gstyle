
import { mailTransporter } from '../config/mailer.js';
import dotenv from 'dotenv';

dotenv.config();

const FRONTEND_BASE_URL = process.env.FRONTEND_BASE_URL || 'http://localhost:5173';
const SMTP_FROM_NAME = process.env.SMTP_FROM_NAME || 'AI CV Maker';
const SMTP_FROM_EMAIL = process.env.SMTP_FROM_EMAIL || 'noreply@aicvmaker.com';


class EmailServiceError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
  }
}

export const sendVerificationEmail = async (email, token) => {
  if (!mailTransporter) {
    console.error("Mail transporter not available. Cannot send verification email.");
    throw new EmailServiceError('Email service is not configured. Please contact support.', 503);
  }

  const verificationLink = `${FRONTEND_BASE_URL}/#/verify-email?token=${token}`;
  const mailOptions = {
    from: `"${SMTP_FROM_NAME}" <${SMTP_FROM_EMAIL}>`,
    to: email,
    subject: 'Verify Your Email Address - AI CV Maker',
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: auto; border: 1px solid #ddd; padding: 20px; border-radius: 5px;">
        <h2 style="color: #0056b3;">Welcome to AI CV Maker!</h2>
        <p>Thank you for signing up. Please verify your email address to complete your registration and activate your account.</p>
        <p>Click the button below to verify your email:</p>
        <p style="text-align: center; margin: 20px 0;">
          <a href="${verificationLink}" style="background-color: #007bff; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-size: 16px; display: inline-block;">Verify Email Address</a>
        </p>
        <p>If you did not create an account, no further action is required and you can safely ignore this email.</p>
        <p style="font-size: 0.9em; color: #777;">This link will expire in 24 hours.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;"/>
        <p style="font-size: 0.9em; color: #777;">If you're having trouble clicking the button, copy and paste the URL below into your web browser:<br/>
          <a href="${verificationLink}" style="color: #007bff;">${verificationLink}</a>
        </p>
        <p style="font-size: 0.8em; color: #aaa; text-align: center; margin-top: 30px;">&copy; ${new Date().getFullYear()} AI CV Maker. All rights reserved.</p>
      </div>
    `,
  };

  try {
    await mailTransporter.sendMail(mailOptions);
    console.log(`Verification email sent to ${email}`);
  } catch (error) {
    console.error(`Error sending verification email to ${email}:`, error);
    // Log the detailed error, but throw a more generic one to the caller
    throw new EmailServiceError('Failed to send verification email. Please try again later or contact support.', 500);
  }
};

export const sendPasswordResetEmail = async (email, token) => {
  if (!mailTransporter) {
    console.error("Mail transporter not available. Cannot send password reset email.");
    throw new EmailServiceError('Email service is not configured. Please contact support.', 503);
  }

  const resetLink = `${FRONTEND_BASE_URL}/#/reset-password?token=${token}`;
  const mailOptions = {
    from: `"${SMTP_FROM_NAME}" <${SMTP_FROM_EMAIL}>`,
    to: email,
    subject: 'Password Reset Request - AI CV Maker',
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: auto; border: 1px solid #ddd; padding: 20px; border-radius: 5px;">
        <h2 style="color: #0056b3;">Password Reset Request</h2>
        <p>You recently requested to reset your password for your AI CV Maker account. If this was you, click the button below to choose a new password.</p>
        <p style="text-align: center; margin: 20px 0;">
          <a href="${resetLink}" style="background-color: #007bff; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-size: 16px; display: inline-block;">Reset Your Password</a>
        </p>
        <p>If you did not request a password reset, please ignore this email or contact support if you have concerns. Your password will not be changed.</p>
        <p style="font-size: 0.9em; color: #777;">This link will expire in 1 hour.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;"/>
        <p style="font-size: 0.9em; color: #777;">If you're having trouble clicking the button, copy and paste the URL below into your web browser:<br/>
          <a href="${resetLink}" style="color: #007bff;">${resetLink}</a>
        </p>
        <p style="font-size: 0.8em; color: #aaa; text-align: center; margin-top: 30px;">&copy; ${new Date().getFullYear()} AI CV Maker. All rights reserved.</p>
      </div>
    `,
  };

  try {
    await mailTransporter.sendMail(mailOptions);
    console.log(`Password reset email sent to ${email}`);
  } catch (error) {
    console.error(`Error sending password reset email to ${email}:`, error);
    throw new EmailServiceError('Failed to send password reset email. Please try again later or contact support.', 500);
  }
};
