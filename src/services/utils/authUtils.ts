import { AuthState, User } from "../types/auth";

const AUTH_STORAGE_KEY = 'jobfinder_auth';

export const authUtils = {
  saveAuthState(authState: AuthState): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authState));
      localStorage.setItem('jobfinder_last_activity', Date.now().toString());
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
  },  clearAuthState(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      localStorage.removeItem('jobfinder_last_activity');
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('jobfinder_')) {
          keysToRemove.push(key);
        }
      }
      
      keysToRemove.forEach(key => localStorage.removeItem(key));
    }
  },

  forceAuthClear(): void {
    this.clearAuthState();
  
    if (typeof document !== 'undefined') {
      document.cookie.split(";").forEach(function(c) { 
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
      });
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

  updateUser(updatedUser: Partial<User>): void {
    const authState = this.getAuthState();
    if (authState && authState.user) {
      const newAuthState = {
        ...authState,
        user: {
          ...authState.user,
          ...updatedUser
        }
      };
      this.saveAuthState(newAuthState);
    }
  },

  getToken(): string | null {
    const authState = this.getAuthState();
    return authState?.token || null;
  },
  getAuthHeaders(): Record<string, string> {
    const token = this.getToken();
    if (!token) {
      return {};
    }
    const headers: Record<string, string> = {
      'Authorization': `Bearer ${token}`,
    };
    
    return headers;
  },
  getUserDisplayName(): string {
    if (typeof window === 'undefined') return 'Guest';
    
    const user = this.getUser();
    if (!user) return 'Guest';
    
    return `${user.firstName} ${user.lastName}`.trim() || user.username || user.email;
  },

  getUserInitials(): string {
    if (typeof window === 'undefined') return 'G';
    
    const user = this.getUser();
    if (!user) return 'G';
    
    const firstName = user.firstName?.charAt(0)?.toUpperCase() || '';
    const lastName = user.lastName?.charAt(0)?.toUpperCase() || '';
    
    if (firstName && lastName) {
      return firstName + lastName;
    }
    
    return firstName || lastName || user.username?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || 'U';
  }
};
