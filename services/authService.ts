import type { User } from '../App'; // Assuming User interface is in App.tsx

const API_BASE_URL = '/api/auth'; // Using relative path for proxy

interface AuthResponse {
  user: User;
  token: string; // Mock token
  message?: string;
}

export const signupWithEmailPassword = async (email: string, password?: string, name?: string): Promise<User> => {
  const response = await fetch(`${API_BASE_URL}/signup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password, name: name || email.split('@')[0] }), // Send name if available, else derive
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

export const loginWithGoogle = async (email: string): Promise<User> => {
  const response = await fetch(`${API_BASE_URL}/google`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email }), // Simulate sending an email or token
  });
  const data: AuthResponse = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Google login failed');
  }
  return data.user;
};

export const loginWithLinkedIn = async (email: string): Promise<User> => {
  const response = await fetch(`${API_BASE_URL}/linkedin`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email }), // Simulate sending an email or token
  });
  const data: AuthResponse = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'LinkedIn login failed');
  }
  return data.user;
};
