
import dotenv from 'dotenv';

dotenv.config();

export const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@aicvmaker.com';
export const MODEL_NAME = process.env.GEMINI_MODEL_NAME || 'gemini-1.5-flash-latest'; // Or your specific model like 'gemini-2.5-flash-preview-04-17'
export const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;

if (!GOOGLE_CLIENT_ID) {
    console.error("CRITICAL: GOOGLE_CLIENT_ID is not set in .env. Google Sign-In backend verification will fail.");
}
if (!process.env.API_KEY) {
  console.error("CRITICAL: API_KEY for the AI service is not set in .env. CV generation will fail.");
}
