
import type { User, SignupResponse } from '../types'; // Updated import

const API_BASE_URL = '/api/auth';

interface AuthResponse {
  user: User;
  token: string;
  message: string;
}

interface SimpleMessageResponse {
    message: string;
    email?: string; // For UI messages related to a specific email
    needsVerification?: boolean; // Flag for login attempts on unverified accounts
    emailForResend?: string; // Email to pre-fill for resend verification
    useGoogleSignIn?: boolean; // Flag to suggest Google Sign-In
}

// More specific error response type for better handling if needed
interface ErrorResponse extends SimpleMessageResponse {
  // any other error specific fields like 'code' or 'details' could go here
}


const handleAuthSuccessResponse = async (response: Response): Promise<User> => {
  const data: AuthResponse | ErrorResponse = await response.json();
  if (!response.ok) {
    const errorMessage = String((data as ErrorResponse).message || `Error ${response.status}`);
    const error = new Error(errorMessage) as any; // Explicitly cast to any for adding custom properties
    if ((data as ErrorResponse).needsVerification) error.needsVerification = true;
    if ((data as ErrorResponse).emailForResend) error.emailForResend = (data as ErrorResponse).emailForResend;
    if ((data as ErrorResponse).useGoogleSignIn) error.useGoogleSignIn = true;
    throw error;
  }
  // Type guard for successful response
  if (!(data as AuthResponse).user) {
    throw new Error("User data is missing in successful authentication response.");
  }
  return (data as AuthResponse).user;
};

const handleSimpleMessageResponse = async (response: Response): Promise<SimpleMessageResponse> => {
    const data: SimpleMessageResponse | ErrorResponse = await response.json();
    if (!response.ok) {
        const errorMessage = String((data as ErrorResponse).message || `Error ${response.status}`);
        throw new Error(errorMessage);
    }
    // Type guard for successful response
    if (typeof (data as SimpleMessageResponse).message === 'undefined') {
        throw new Error("Message is missing in successful simple response.");
    }
    return data as SimpleMessageResponse;
};


export const signupWithEmailPassword = async (email: string, password: string, name: string): Promise<SignupResponse> => {
  const response = await fetch(`${API_BASE_URL}/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, name }),
  });
  // SignupResponse is a SimpleMessageResponse with potentially an email field
  const data: SignupResponse | ErrorResponse = await response.json();
   if (!response.ok) {
    const errorMessage = String((data as ErrorResponse).message || `Error ${response.status}`);
    throw new Error(errorMessage);
  }
  if (typeof (data as SignupResponse).message === 'undefined') {
    throw new Error("Message is missing in signup response.");
  }
  return data as SignupResponse; // Backend returns { message: string, email?: string }
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

export const changePassword = async (userId: string | number, currentPassword: string, newPassword: string): Promise<SimpleMessageResponse> => {
    const response = await fetch(`${API_BASE_URL}/change-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // In a real app, user identification would typically come from a secure session/token handled by the backend.
        // For this exercise structure, we pass userId, assuming the backend uses it (potentially after re-validating auth).
        // A real-world scenario would often include an Authorization header with a JWT.
        body: JSON.stringify({ userId, currentPassword, newPassword }),
    });
    return handleSimpleMessageResponse(response);
};
