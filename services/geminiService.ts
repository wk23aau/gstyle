
interface CVGenerationSuccessResponse {
  cvContent: string;
  credits_available?: number; // For registered users, backend might return updated credits
}

interface CVGenerationErrorResponse {
  message: string;
}

type CVGenerationResponse = CVGenerationSuccessResponse | CVGenerationErrorResponse;


export const generateCVContent = async (jobInfo: string, userId?: number | string): Promise<string> => { // Return only CV string for now, credits handled by App.tsx callback
  try {
    const payload: { jobInfo: string; userId?: number | string } = { jobInfo };
    if (userId) {
      payload.userId = userId;
    }

    const response = await fetch('/api/cv/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data: CVGenerationResponse = await response.json();

    if (!response.ok) {
      const errorMessage = String((data as CVGenerationErrorResponse).message || `Error ${response.status}: Failed to generate CV`);
      throw new Error(errorMessage);
    }
    
    const successData = data as CVGenerationSuccessResponse;
    if (!successData.cvContent) {
      throw new Error('Received empty CV content from the server.');
    }
    
    // The actual User.credits_available will be updated via a callback to App.tsx
    // to keep App.tsx as the source of truth for currentUser.
    // This function focuses on returning the CV string.
    return successData.cvContent;

  } catch (error) {
    console.error('Error in generateCVContent service:', error);
    if (error instanceof Error) {
      throw error; 
    } else {
      const unknownErrorMessage = String(error) || 'An unexpected error occurred while contacting the CV generation service.';
      throw new Error(unknownErrorMessage);
    }
  }
};
