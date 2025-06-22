import type { SavedCvSummary, SavedCvFull } from '../types';

interface ApiResponse {
  message?: string;
}

// Function to get current user ID (placeholder, replace with actual auth context if available)
const getCurrentUserId = (): string | number | null => {
  const storedUser = localStorage.getItem('currentUser');
  if (storedUser) {
    try {
      const user = JSON.parse(storedUser);
      return user.id;
    } catch (e) {
      console.error("Failed to parse user from localStorage for User ID", e);
      return null;
    }
  }
  return null;
};


export const getSavedCvs = async (): Promise<SavedCvSummary[]> => {
  const userId = getCurrentUserId();
  if (!userId) {
    console.warn('User ID not found, cannot fetch saved CVs.');
    return []; // Or throw new Error('User not authenticated');
  }

  try {
    const response = await fetch(`/api/cv/saved?userId=${encodeURIComponent(userId)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData: ApiResponse = await response.json().catch(() => ({ message: `Error ${response.status}: Failed to fetch saved CVs` }));
      throw new Error(errorData.message);
    }
    return await response.json() as SavedCvSummary[];
  } catch (error) {
    console.error('Error in getSavedCvs service:', error);
    if (error instanceof Error) throw error;
    throw new Error('An unexpected error occurred while fetching saved CVs.');
  }
};

export const getFullSavedCv = async (cvId: number | string): Promise<SavedCvFull> => {
    const userId = getCurrentUserId();
    if (!userId) {
        throw new Error('User not authenticated. Cannot fetch full CV.');
    }
    try {
        const response = await fetch(`/api/cv/saved/${cvId}?userId=${encodeURIComponent(userId)}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        });
        if (!response.ok) {
            const errorData: ApiResponse = await response.json().catch(() => ({ message: `Error ${response.status}: Failed to fetch CV details.` }));
            throw new Error(errorData.message);
        }
        return await response.json() as SavedCvFull;
    } catch (error) {
        console.error(`Error fetching full CV (ID: ${cvId}):`, error);
        if (error instanceof Error) throw error;
        throw new Error('An unexpected error occurred while fetching the CV.');
    }
};

export const deleteSavedCv = async (cvId: number | string): Promise<void> => {
  const userId = getCurrentUserId();
  if (!userId) {
    throw new Error('User not authenticated. Cannot delete CV.');
  }

  try {
    const response = await fetch(`/api/cv/saved/${cvId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      // Backend expects userId in body for this simplified DELETE
      body: JSON.stringify({ userId }), 
    });

    if (!response.ok) {
      const errorData: ApiResponse = await response.json().catch(() => ({ message: `Error ${response.status}: Failed to delete CV` }));
      throw new Error(errorData.message);
    }
    // No content expected on successful delete typically, or a simple { message: "..." }
  } catch (error) {
    console.error(`Error deleting CV (ID: ${cvId}):`, error);
    if (error instanceof Error) throw error;
    throw new Error('An unexpected error occurred while deleting the CV.');
  }
};
