
// This service was imported by HeroSection.tsx but not provided.
// Creating a placeholder based on its usage.
// It's expected to call a backend API at /api/cv/generate.

interface CVGenerationResponse {
  cvContent: string;
  message?: string; // For errors
}

export const generateCVContent = async (jobInfo: string): Promise<string> => {
  try {
    const response = await fetch('/api/cv/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ jobInfo }),
    });

    const data: CVGenerationResponse = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `Error ${response.status}: Failed to generate CV`);
    }

    if (!data.cvContent) {
      throw new Error('Received empty CV content from the server.');
    }
    
    return data.cvContent;

  } catch (error) {
    console.error('Error in generateCVContent service:', error);
    if (error instanceof Error) {
      throw error; // Re-throw the original error to be caught by the component
    }
    throw new Error('An unexpected error occurred while contacting the CV generation service.');
  }
};

// The direct Gemini call function (generateCVContentDirect) was mentioned as unused in HeroSection.tsx comments.
// If it were needed, it would look something like this, but requires @google/genai and API key handling.
/*
import { GoogleGenAI } from '@google/genai';

const API_KEY = process.env.REACT_APP_GEMINI_API_KEY; // This would need to be configured if used client-side (not recommended)

export const generateCVContentDirect = async (jobInfo: string): Promise<string> => {
  if (!API_KEY) {
    throw new Error("Gemini API Key is not configured for direct client-side generation.");
  }
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  const model = ai.models.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

  const prompt = `
    You are an expert CV writer... (full prompt here)
    Job Information:
    ---
    ${jobInfo}
    ---
    CV Outline:
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    return text;
  } catch (error) {
    console.error('Error generating CV content directly with Gemini API:', error);
    throw new Error('Failed to generate CV content directly with AI.');
  }
};
*/
