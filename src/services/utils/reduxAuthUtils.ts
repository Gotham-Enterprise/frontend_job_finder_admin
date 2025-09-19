import { store } from '@/store';
import { setUser, clearUser, setLoading, setError } from '@/store/slices/authSlice';
import { setPermissions, clearPermissions } from '@/store/slices/permissionSlice';

// This service will help manage authentication state and permissions using Redux
export class ReduxAuthService {
  
  // Initialize user from API response (like /api/auth/me)
  static initializeAuth(userData: any) {
    try {
      store.dispatch(setLoading(true));
      
      if (userData && userData.data) {
        const user = userData.data;
        
        // Set user data
        store.dispatch(setUser(user));
        
        // Set permissions if available
        if (user.adminRoleAccess && user.adminRoleAccess.rolePermissions) {
          store.dispatch(setPermissions(user.adminRoleAccess.rolePermissions));
        }
      } else {
        store.dispatch(clearUser());
        store.dispatch(clearPermissions());
      }
    } catch (error) {
      console.error('Error initializing auth:', error);
      store.dispatch(setError('Failed to initialize authentication'));
    } finally {
      store.dispatch(setLoading(false));
    }
  }

  // Clear authentication state (for logout)
  static clearAuth() {
    store.dispatch(clearUser());
    store.dispatch(clearPermissions());
  }

  // Get current user from store
  static getCurrentUser() {
    return store.getState().auth.user;
  }

  // Get current permissions from store  
  static getCurrentPermissions() {
    return store.getState().permission.permissions;
  }

  // Check if user has specific permission
  static hasPermission(module: string, action: 'view' | 'add' | 'edit' | 'delete'): boolean {
    const permissions = store.getState().permission.permissions;
    const permission = permissions[module];
    if (!permission) return false;
    return permission[action];
  }
}
