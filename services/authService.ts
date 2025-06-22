
import type { User, SignupResponse } from '../App'; // Assuming User type is in App.tsx

const API_BASE_URL = '/api/auth';

interface AuthResponse {
  user: User;
  token: string; 
  message: string;
}

interface SimpleMessageResponse {
    message: string;
    email?: string;
    needsVerification?: boolean; 
    emailForResend?: string; 
}

interface ErrorResponse extends SimpleMessageResponse {
  // any other error specific fields
}


const handleAuthSuccessResponse = async (response: Response): Promise<User> => {
  const data: AuthResponse | ErrorResponse = await response.json();
  if (!response.ok) {
    const error = new Error((data as ErrorResponse).message || `Error ${response.status}`) as any;
    if ((data as ErrorResponse).needsVerification) error.needsVerification = true;
    if ((data as ErrorResponse).emailForResend) error.emailForResend = (data as ErrorResponse).emailForResend;
    throw error;
  }
  return (data as AuthResponse).user;
};

const handleSimpleMessageResponse = async (response: Response): Promise<SimpleMessageResponse> => {
    const data: SimpleMessageResponse | ErrorResponse = await response.json();
    if (!response.ok) {
        throw new Error((data as ErrorResponse).message || `Error ${response.status}`);
    }
    return data as SimpleMessageResponse;
};


export const signupWithEmailPassword = async (email: string, password: string, name: string): Promise<SignupResponse> => {
  const response = await fetch(`${API_BASE_URL}/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, name }),
  });
  const data: SignupResponse | ErrorResponse = await response.json();
   if (!response.ok) {
    throw new Error((data as ErrorResponse).message || `Error ${response.status}`);
  }
  return data as SignupResponse;
};

export const loginWithEmailPassword = async (email: string, password: string): Promise<User> => {
  const response = await fetch(`${API_BASE_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return handleAuthSuccessResponse(response);
};

export const signInWithGoogleIdToken = async (idToken: string): Promise<User> => {
  const response = await fetch(`${API_BASE_URL}/google-signin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idToken }),
  });
  return handleAuthSuccessResponse(response);
};

export const verifyEmailToken = async (token: string): Promise<SimpleMessageResponse> => {
    const response = await fetch(`${API_BASE_URL}/verify-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
    });
    return handleSimpleMessageResponse(response);
};

export const requestResendVerificationEmail = async (email: string): Promise<SimpleMessageResponse> => {
    const response = await fetch(`${API_BASE_URL}/resend-verification-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
    });
    return handleSimpleMessageResponse(response);
};

export const requestPasswordReset = async (email: string): Promise<SimpleMessageResponse> => {
    const response = await fetch(`${API_BASE_URL}/request-password-reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
    });
    return handleSimpleMessageResponse(response);
};

export const resetPassword = async (token: string, newPassword: string): Promise<SimpleMessageResponse> => {
    const response = await fetch(`${API_BASE_URL}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword }),
    });
    return handleSimpleMessageResponse(response);
};
