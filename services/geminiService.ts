
// No longer importing GoogleGenAI directly in the frontend service
// import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

// --- Direct API Call (Frontend-Only Approach) ---
// This section is being removed as per the requirement to use backend only.
/*
let ai: GoogleGenAI | null = null;
const MODEL_NAME = 'gemini-2.5-flash-preview-04-17';

try {
  if (typeof process !== 'undefined' && process.env && process.env.API_KEY) {
    ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  } else {
    console.warn("Gemini API Key (process.env.API_KEY) is not set. Direct API calls will fail.");
  }
} catch (e) {
  console.error("Error initializing GoogleGenAI for direct calls (frontend):", e);
  ai = null;
}
*/

/**
 * REMOVED: Generates CV content by making a direct call to the Gemini API from the frontend.
 * This approach is no longer used. The application now uses a backend.
 */
/*
export const generateCVContentDirect = async (jobInfo: string): Promise<string> => {
  // This function is intentionally left non-functional or could be removed entirely.
  throw new Error("Direct API calls from the frontend are disabled. Use the backend service.");
};
*/


/**
 * Generates CV content by calling the backend API.
 * This is now the sole method for CV generation.
 */
export const generateCVContent = async (jobInfo: string): Promise<string> => {
  // Frontend code to call the simulated backend API
  try {
    const response = await fetch('/api/cv/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ jobInfo }),
    });

    if (!response.ok) {
      // Try to parse error message from backend, otherwise use status text
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        // If response is not JSON, use statusText or a generic message
        errorData = { message: response.statusText || `HTTP error! status: ${response.status}` };
      }
      throw new Error(errorData.message || `Backend request failed with status: ${response.status}`);
    }

    const data = await response.json();
    if (!data.cvContent || data.cvContent.trim() === "") {
        throw new Error("Received an empty or invalid CV content from the backend.");
    }
    return data.cvContent;

  } catch (error) {
    console.error('Error calling backend for CV content:', error);
    if (error instanceof Error) {
      // The error message from the backend (or fetch failure) will be propagated.
      throw new Error(`${error.message}`);
    }
    throw new Error('An unknown error occurred while communicating with the backend.');
  }
};
