
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const aiServiceApiKey = process.env.API_KEY;
const MODEL_NAME = process.env.GEMINI_MODEL_NAME || 'gemini-1.5-flash-latest'; // Fallback if not in appConfig

if (!aiServiceApiKey) {
  console.error("CRITICAL: API_KEY for the AI service is not set in .env. CV generation will fail.");
}

const ai = new GoogleGenAI({ apiKey: aiServiceApiKey || "FALLBACK_KEY_DO_NOT_USE" }); 

class AIServiceError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
  }
}

export const generateCvWithAI = async (jobInfo) => {
  if (!jobInfo || typeof jobInfo !== 'string' || !jobInfo.trim()) {
    throw new AIServiceError('Job information is required.', 400);
  }
  if (!aiServiceApiKey || aiServiceApiKey === "FALLBACK_KEY_DO_NOT_USE") {
    console.error("AI Service API Key not configured on the server. Throwing error.");
    throw new AIServiceError("AI Service is not configured on the server. Please contact support.", 503);
  }

  // Enhanced prompt structure
  const prompt = `
    You are an expert CV (Resume) writer and career coach. Your task is to generate a comprehensive, professional, and ATS-friendly CV outline based on the provided job information. The outline should be structured logically and include all essential sections.

    Job Information Provided:
    ---
    ${jobInfo}
    ---

    Please generate a CV outline that includes the following sections, tailored to the job information:
    1.  **Contact Information:** (Placeholder for Name, Phone, Email, LinkedIn, Portfolio if applicable)
    2.  **Summary/Objective:** A concise and impactful statement highlighting key qualifications and career goals relevant to the job.
    3.  **Skills:** A list of relevant technical and soft skills (categorize if appropriate, e.g., Programming Languages, Tools, Methodologies).
    4.  **Work Experience:** For each role (placeholder if no specific experience is implied by job info, otherwise tailor to job type):
        *   Job Title
        *   Company Name, Location
        *   Dates of Employment
        *   Key responsibilities and achievements (use action verbs, quantify where possible).
    5.  **Education:**
        *   Degree Name
        *   Major/Field of Study
        *   University Name, Location
        *   Graduation Date (or Expected)
    6.  **Projects (Optional but Recommended):** Relevant personal or academic projects, especially for technical roles or entry-level candidates.
    7.  **Certifications/Licenses (If Applicable):**
    8.  **Awards/Recognitions (If Applicable):**
    
    Format the output clearly. Use bullet points for lists. Ensure the tone is professional.
    
    CV Outline:
  `;

  try {
    if (!ai.models || typeof ai.models.generateContent !== 'function') {
      console.error('Server AI SDK configuration error: ai.models.generateContent is not a function.');
      throw new AIServiceError('AI Service SDK is not properly configured on the server.', 500);
    }
    
    const result = await ai.models.generateContent({ model: MODEL_NAME, contents: prompt });
    const textOutput = result.text;
    
    if (!textOutput?.trim()) {
      console.warn('AI model returned an empty or invalid response for jobInfo:', jobInfo);
      throw new AIServiceError('Received an empty or invalid response from the AI model. Try refining your job information.', 502); // 502 Bad Gateway if AI service misbehaves
    }
    return textOutput;

  } catch (error) {
    console.error(`Error generating CV content with AI service for jobInfo "${jobInfo}":`, error.message);
    let errMsg = `AI generation failed: ${error.message || 'Unknown error from AI service'}`;
    let errStatusCode = 500;
    
    const lowerMsg = error.message?.toLowerCase();
    if (lowerMsg?.includes("api key not valid") || lowerMsg?.includes("unauthenticated") || lowerMsg?.includes("permission denied") || lowerMsg?.includes("quota")) {
      errMsg = "There is an issue with the AI service configuration or usage limits. Please contact support.";
      errStatusCode = 503; // Service Unavailable
    } else if (lowerMsg?.includes("model not found") || lowerMsg?.includes("invalid model")) {
      errMsg = "The configured AI model is currently unavailable or invalid. Please try again later or contact support.";
      errStatusCode = 503;
    } else if (error.message?.includes("Deadline exceeded") || error.message?.includes("timeout")) {
        errMsg = "The AI service took too long to respond. Please try again later.";
        errStatusCode = 504; // Gateway Timeout
    }
    
    throw new AIServiceError(errMsg, errStatusCode);
  }
};
