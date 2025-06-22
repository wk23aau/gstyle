
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const smtpConfig = {
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || "587", 10),
  secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS, // This MUST be the actual password
  },
  // Optional: Add TLS options if needed for certain servers, e.g., self-signed certs
  // tls: {
  //   rejectUnauthorized: false // Use with caution, only for local/dev testing with self-signed certs
  // }
};

let mailTransporter;

try {
  mailTransporter = nodemailer.createTransport(smtpConfig);
  // Verify connection configuration
  mailTransporter.verify(function(error, success) {
    if (error) {
      console.error("Nodemailer configuration error:", error);
      // Depending on policy, you might want to prevent app start or just log warning
      // For now, we'll log and let the app continue, email sending will fail.
      mailTransporter = null; // Set to null so attempts to use it will clearly fail
    } else {
      console.log("Nodemailer is configured correctly. Server is ready to take our messages.");
    }
  });
} catch (error) {
    console.error("Failed to create Nodemailer transport:", error);
    mailTransporter = null;
}


export { mailTransporter };
