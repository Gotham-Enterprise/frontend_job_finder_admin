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
      });      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = errorData.message || 'Login failed';
        
        showToast.error('Login Error', errorMessage);
        
      }

      return await response.json();
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
        const errorMessage = 'Logout failed';
        showToast.error('Logout Error', errorMessage);
        
      }
    } catch (error) {
      throw error;
    }
  }
};
