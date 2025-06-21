import type { User } from '../App'; // Assuming User interface is in App.tsx

const API_BASE_URL = '/api/auth'; // Using relative path for proxy

interface AuthResponse {
  user: User;
  token: string; // Your app's mock JWT token
  message?: string;
}

export const signupWithEmailPassword = async (email: string, password?: string, name?: string): Promise<User> => {
  const response = await fetch(`${API_BASE_URL}/signup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password, name: name || email.split('@')[0] }),
  });
  const data: AuthResponse = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Signup failed');
  }
  return data.user;
};

export const loginWithEmailPassword = async (email: string, password?: string): Promise<User> => {
  const response = await fetch(`${API_BASE_URL}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });
  const data: AuthResponse = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Login failed');
  }
  return data.user;
};

// This function will send the ID token obtained from Google to your backend
export const signInWithGoogleIdToken = async (idToken: string): Promise<User> => {
  const response = await fetch(`${API_BASE_URL}/google-signin`, { // New backend endpoint
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ idToken }),
  });
  const data: AuthResponse = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Google Sign-In failed on backend');
  }
  return data.user;
};
