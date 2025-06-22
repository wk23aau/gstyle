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
      const errorMessage = String(data.message || `Error ${response.status}: Failed to generate CV`);
      throw new Error(errorMessage);
    }

    if (!data.cvContent) {
      throw new Error('Received empty CV content from the server.');
    }
    
    return data.cvContent;

  } catch (error) {
    console.error('Error in generateCVContent service:', error);
    if (error instanceof Error) {
      throw error; // Re-throw the original error to be caught by the component
    } else {
      // Ensure 'error' is converted to string if it's not already an Error object.
      const unknownErrorMessage = String(error) || 'An unexpected error occurred while contacting the CV generation service.';
      throw new Error(unknownErrorMessage);
    }
  }
  // This part should ideally be unreachable in an async function with try/catch 
  // where all paths within try either return or throw, and catch also throws.
  // However, to satisfy very strict linters or type checking that might not fully infer this:
  // throw new Error("generateCVContent function reached an unexpected state.");
};

// The direct Gemini call function (generateCVContentDirect) was mentioned as unused in HeroSection.tsx comments.
// If it were needed, it would look something like this, but requires @google/genai and API key handling.
/*
import { GoogleGenAI } from '@google/genai';

// Assuming API_KEY is handled securely, e.g. via an environment variable accessible in this context
// For client-side, this is NOT recommended. This example assumes a context where API_KEY is available.
// const API_KEY = process.env.REACT_APP_GEMINI_API_KEY; 


export const generateCVContentDirect = async (jobInfo: string): Promise<string> => {
  // if (!API_KEY) {
  //   throw new Error("Gemini API Key is not configured for direct client-side generation.");
  // }
  // const ai = new GoogleGenAI({ apiKey: API_KEY });

  // IMPORTANT: Replace with a current, valid model name as per guidelines.
  // 'gemini-1.5-flash-latest' is a placeholder and might be deprecated.
  // Use a model like 'gemini-2.5-flash-preview-04-17' for text tasks.
  // const model = ai.models.getGenerativeModel({ model: "gemini-2.5-flash-preview-04-17" });


  const prompt = `
    You are an expert CV writer... (full prompt here)
    Job Information:
    ---
    ${jobInfo}
    ---
    CV Outline:
  `;

  try {
    // Correct way to call according to newer guidelines, if 'getGenerativeModel' then 'generateContent' is used:
    // const result = await model.generateContent(prompt);
    // const response = result.response;
    // const text = response.text();
    // return text;

    // Or, if using the direct ai.models.generateContent:
    // const ai = new GoogleGenAI({ apiKey: process.env.API_KEY }); // API_KEY must be from process.env.API_KEY
    // const result = await ai.models.generateContent({
    //   model: 'gemini-2.5-flash-preview-04-17',
    //   contents: prompt,
    // });
    // const text = result.text;
    // return text;
    
    // Placeholder to make function valid if uncommented
    throw new Error("Direct Gemini call not fully implemented with correct API usage and model.");

  } catch (error) {
    console.error('Error generating CV content directly with Gemini API:', error);
    if (error instanceof Error) {
        throw error;
    }
    throw new Error('Failed to generate CV content directly with AI.');
  }
};
*/
