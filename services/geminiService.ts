
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

// --- For Direct API Call (Frontend-Only Approach) ---
// The API_KEY is expected to be available in the execution environment (e.g., process.env.API_KEY).
// For frontend-only, this typically requires a build step to inject it or a secure way to provide it.
// Directly embedding API keys in client-side code is not recommended for production.
let ai: GoogleGenAI | null = null;
const MODEL_NAME = 'gemini-1.5-flash-latest'; // Updated model name

try {
  if (typeof process !== 'undefined' && process.env && process.env.API_KEY) {
    ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  } else {
    // This console warning is for development. In a real scenario, API key handling needs to be robust.
    console.warn("Gemini API Key (process.env.API_KEY) is not set. Direct API calls will fail.");
  }
} catch (e) {
  console.error("Error initializing GoogleGenAI for direct calls (frontend):", e);
  ai = null; // Ensure ai is null if initialization fails
}


/**
 * Generates CV content by making a direct call to the Gemini API from the frontend.
 * This approach requires the API key to be securely available in the frontend environment.
 */
export const generateCVContentDirect = async (jobInfo: string): Promise<string> => {
  if (!ai) {
    throw new Error("Gemini AI client is not initialized. This might be due to a missing API_KEY in the frontend environment (process.env.API_KEY).");
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
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
    });
    
    const textOutput = response.text;
    if (!textOutput || textOutput.trim() === "") { // Also check for empty string
        throw new Error("Received an empty or invalid response from the AI model.");
    }
    return textOutput;

  } catch (error) {
    console.error('Error generating CV content (direct API call):', error);
    if (error instanceof Error) {
        const lowerErrorMessage = error.message.toLowerCase();
        if (lowerErrorMessage.includes("api key not valid") ||
            (lowerErrorMessage.includes("api key") && (lowerErrorMessage.includes("invalid") || lowerErrorMessage.includes("missing"))) ||
            lowerErrorMessage.includes("authentication failed") ||
            lowerErrorMessage.includes("permission denied") ||
            lowerErrorMessage.includes("unauthenticated") ||
            lowerErrorMessage.includes("api_key") // broader check
            ) {
            throw new Error("Gemini API Key is invalid, missing, not authorized, or improperly configured for direct frontend calls. Please ensure process.env.API_KEY is correctly set and has the necessary permissions.");
        }
         throw new Error(`AI generation failed (direct API call): ${error.message}`);
    }
    throw new Error('An unknown error occurred while communicating with the AI model (direct API call).');
  }
};


/**
 * Generates CV content by calling a simulated backend API.
 * This is the current default approach used by HeroSection.tsx.
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