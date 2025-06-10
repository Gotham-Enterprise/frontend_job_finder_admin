import { LoginCredentials, AuthResponse } from '../types/auth';
import { showToast } from '../utils/toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const authApi = {  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', 
        body: JSON.stringify(credentials),
      });     
      
      const data = await response.json();
        if (!response.ok) {
        const errorMessage = data.message || 'Login failed';

        switch (response.status) {
          case 401:
            showToast.error('Login Error', 'Invalid email or password');
            throw new Error('Invalid credentials');
            
          case 403:
         
            showToast.error('Login Error', 'Account access denied. Please contact support.');
            throw new Error('Account access denied');
            
          case 409:
          
            try {
              await authApi.logout();
              return await authApi.login(credentials);
            } catch (logoutError) {
              showToast.error('Login Error', 'Session conflict. Please try again.');
              throw new Error('Session conflict');
            }
            
          case 422:
            showToast.error('Login Error', errorMessage || 'Invalid input data');
            throw new Error(errorMessage || 'Validation failed');
            
          case 429:
            showToast.error('Login Error', 'Too many login attempts. Please try again later.');
            throw new Error('Rate limit exceeded');
            
          case 500:
            showToast.error('Login Error', 'Server error. Please try again later.');
            throw new Error('Server error');
            
          case 503:
            showToast.error('Login Error', 'Service temporarily unavailable. Please try again later.');
            throw new Error('Service unavailable');
            
          default:
            showToast.error('Login Error', errorMessage);
            throw new Error(errorMessage);
        }
      }

      return data;
    } catch (error) {
      throw error;
    }
  },
    async logout(): Promise<void> {
    try {
      const response = await fetch(`${API_URL}/api/auth/logout`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });     
      
      if (!response.ok) {
        // Handle specific logout error cases
        switch (response.status) {
          case 401:
            // User not authenticated - this is actually fine for logout
            return;
            
          case 404:
            // Session not found - also fine for logout
            return;
            
          case 500:
            showToast.error('Logout Error', 'Server error during logout');
            throw new Error('Server error during logout');
            
          default:
            const errorMessage = 'Logout failed';
            showToast.error('Logout Error', errorMessage);
            throw new Error(errorMessage);
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      showToast.error('Logout Error', errorMessage);
      throw error;
    }
  }
};
