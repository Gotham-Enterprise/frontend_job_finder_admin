import { LoginCredentials, AuthResponse, ForgotPasswordRequest, ForgotPasswordResponse, ResetPasswordRequest, ResetPasswordResponse, ChangePasswordRequest } from '../types/auth';
import { showToast } from '../utils/toast';
import { apiPost, apiGet, apiPut } from './apiUtils';

const ERROR_MESSAGES = {
  400: 'Invalid request data',
  401: 'Invalid email or password',
  403: 'Account access denied. Please contact support.',
  422: 'Invalid input data',
  429: 'Too many login attempts. Please try again later.',
  500: 'Server error. Please try again later.',
  503: 'Service temporarily unavailable. Please try again later.',
} as const;

const clearLocalStorage = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('jobfinder_auth');
    localStorage.removeItem('jobfinder_last_activity');
  }
};

const performLoginRequest = async (credentials: LoginCredentials): Promise<Response> => {
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  return fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(credentials),
  });
};

const isSessionConflictError = (errorMessage: string, data: any): boolean => {
  return errorMessage.toLowerCase().includes('already logged in') || 
         (data.error && data.error.toLowerCase().includes('already logged in'));
};

const sessionConflict = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  try {

    await authApi.logout();
    clearLocalStorage();
    return await authApi.login(credentials);
  } catch (logoutError) {
    clearLocalStorage();
    const retryResponse = await performLoginRequest(credentials);
    const retryData = await retryResponse.json();
    
    if (retryResponse.ok) {
      return retryData;
    } else {
      showToast.error('Login Error', 'Unable to resolve session conflict. Please try again or contact support.');
      throw new Error('Session conflict - unable to resolve');
    }
  }
};

const loginError = async (
  status: number, 
  errorMessage: string, 
  data: any, 
  credentials: LoginCredentials
): Promise<AuthResponse> => {
  switch (status) {
    case 400:
    case 409:
      if (isSessionConflictError(errorMessage, data)) {
        return await sessionConflict(credentials);
      }
      showToast.error('Login Error', errorMessage || ERROR_MESSAGES[400]);
      throw new Error(errorMessage || 'Bad request');
      
    case 401:
    case 403:
    case 422:
    case 429:
    case 500:
    case 503:
      showToast.error('Login Error', ERROR_MESSAGES[status] || errorMessage);
      throw new Error(ERROR_MESSAGES[status] || errorMessage);
      
    default:
      showToast.error('Login Error', errorMessage);
      throw new Error(errorMessage);
  }
};

export const authApi = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
    
      const response = await performLoginRequest(credentials);
      const data = await response.json();
      
      console.log('Login response:', { 
        status: response.status, 
        ok: response.ok, 
        data: data 
      });

      if (!response.ok) {
        const errorMessage = data.message || data.error || 'Login failed';
      
        return await loginError(response.status, errorMessage, data, credentials);
      }

      return data;
    } catch (error) {

      throw error;
    }
  },

  async logout(): Promise<void> {
    try {
      await apiGet('/api/auth/logout', { includeAuth: false });
    } catch (error) {
      console.warn('Logout: Network or other error during logout, continuing with local cleanup:', error);
    }
  },

  async forgotPassword(request: ForgotPasswordRequest): Promise<ForgotPasswordResponse> {
    try {
      const requestWithAdmin = { ...request, isAdmin: true };
      const response = await apiPost<ForgotPasswordResponse>('/api/auth/forgot-password', requestWithAdmin, { includeAuth: false });
      return response;
    } catch (error: any) {
      throw error;
    }
  },

  async resetPassword(resetToken: string, request: ResetPasswordRequest): Promise<ResetPasswordResponse> {
    try {
      const response = await apiPut<ResetPasswordResponse>(`/api/auth/reset-password/${resetToken}`, request, { includeAuth: false });
      return response;
    } catch (error: any) {
      throw error;
    }
  },

  async changePassword(request: ChangePasswordRequest): Promise<ResetPasswordResponse> {
    try {
      const response = await apiPut<ResetPasswordResponse>('/api/auth/change-password', request, { includeAuth: true });
      return response;
    } catch (error: any) {
      throw error;
    }
  }
};
