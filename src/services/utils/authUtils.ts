import { AuthState, User } from "../types/auth";

const AUTH_STORAGE_KEY = 'jobfinder_auth';

export const authUtils = {
  saveAuthState(authState: AuthState): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authState));
    }
  },

  getAuthState(): AuthState | null {
    if (typeof window !== 'undefined') {
      const authData = localStorage.getItem(AUTH_STORAGE_KEY);
      if (authData) {
        return JSON.parse(authData) as AuthState;
      }
    }
    return null;
  },

  clearAuthState(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  },

  isAuthenticated(): boolean {
    const authState = this.getAuthState();
    return authState?.isAuthenticated === true;
  },
  getUser(): User | null {
    const authState = this.getAuthState();
    return authState?.user || null;
  },

  getToken(): string | null {
    const authState = this.getAuthState();
    return authState?.token || null;
  },

  getAuthHeaders(): Record<string, string> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    return headers;
  }
};
