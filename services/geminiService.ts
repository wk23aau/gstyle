
import type { SavedCv } from '../types';

interface CVGenerationSuccessResponse {
  cvContent: string;
}

interface CVGenerationErrorResponse {
  message: string;
}

type CVGenerationResponse = CVGenerationSuccessResponse | CVGenerationErrorResponse;


export const generateCVContent = async (jobInfo: string, userId?: number | string): Promise<string> => {
  try {
    const payload: { jobInfo: string; userId?: number | string } = { jobInfo };
    if (userId) {
      payload.userId = String(userId); // Ensure userId is string if number
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

// --- Functions for Saved CVs ---

const getAuthHeaders = (): Record<string, string> => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
        try {
            const user = JSON.parse(storedUser);
            if (user && user.id) {
                return { 'x-user-id': String(user.id) };
            }
        } catch (e) {
            console.error("Failed to parse currentUser for auth header", e);
        }
    }
    console.warn("getAuthHeaders: No user ID found in localStorage for x-user-id header.");
    return {};
};

export const getSavedCvs = async (): Promise<SavedCv[]> => {
  try {
    const response = await fetch('/api/cv/saved', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            ...getAuthHeaders() 
        }
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: `Error ${response.status}: Failed to fetch saved CVs. Status: ${response.statusText}` }));
      console.error('getSavedCvs raw error response:', errorData);
      throw new Error(errorData.message || `Failed to fetch saved CVs. HTTP ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error in getSavedCvs service:', error);
    if (error instanceof Error) throw error;
    throw new Error('An unexpected error occurred while fetching saved CVs.');
  }
};

export const getSavedCvById = async (cvId: number): Promise<SavedCv> => {
  try {
    const response = await fetch(`/api/cv/saved/${cvId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            ...getAuthHeaders()
        }
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: `Error ${response.status}: Failed to fetch CV details. Status: ${response.statusText}` }));
      console.error(`getSavedCvById raw error response for CV ID ${cvId}:`, errorData);
      throw new Error(errorData.message || `Failed to fetch CV details for ID ${cvId}. HTTP ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Error in getSavedCvById service for CV ID ${cvId}:`, error);
    if (error instanceof Error) throw error;
    throw new Error(`An unexpected error occurred while fetching CV details for ID ${cvId}.`);
  }
};

export const deleteSavedCvById = async (cvId: number): Promise<{ message: string }> => {
  try {
    const response = await fetch(`/api/cv/saved/${cvId}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            ...getAuthHeaders()
        }
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: `Error ${response.status}: Failed to delete CV. Status: ${response.statusText}` }));
      console.error(`deleteSavedCvById raw error response for CV ID ${cvId}:`, errorData);
      throw new Error(errorData.message || `Failed to delete CV ID ${cvId}. HTTP ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Error in deleteSavedCvById service for CV ID ${cvId}:`, error);
    if (error instanceof Error) throw error;
    throw new Error(`An unexpected error occurred while deleting the CV ID ${cvId}.`);
  }
};