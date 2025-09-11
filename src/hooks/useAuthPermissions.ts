import { useState, useEffect } from 'react';
import { UserPermissions } from '@/services/types/permissions';
import { convertApiPermissionsToUserPermissions } from '@/utils/permissionUtils';
import { authUtils } from '@/services/utils/authUtils';

interface ApiUserData {
  adminRoleAccess: {
    id: number;
    roleName: string;
    rolePermissions: Array<{
      id: string;
      roleId: number;
      permissionId: string;
      add: boolean;
      view: boolean;
      edit: boolean;
      delete: boolean;
      permission: {
        id: string;
        name: string;
        description: string;
      };
    }>;
  };
}

interface UseAuthPermissionsReturn {
  permissions: UserPermissions | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  userRole: { id: number; name: string } | null;
}

export const useAuthPermissions = (): UseAuthPermissionsReturn => {
  const [permissions, setPermissions] = useState<UserPermissions | null>(() => {
    // Try to initialize permissions immediately from localStorage if available
    if (typeof window !== 'undefined') {
      const user = authUtils.getUser();
      if (user && user.adminRoleAccess && user.adminRoleAccess.rolePermissions) {
        try {
         
          return convertApiPermissionsToUserPermissions(user as any);
        } catch (error) {
          console.error('Error converting initial permissions:', error);
        }
      }
    }
    return null;
  });
  
  const [loading, setLoading] = useState(() => {
    // Don't start in loading state if we already have permissions from localStorage
    if (typeof window !== 'undefined') {
      const user = authUtils.getUser();
      const hasPermissions = !!(user && user.adminRoleAccess && user.adminRoleAccess.rolePermissions);
   
      return !hasPermissions;
    }
    return true;
  });
  
  const [error, setError] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<{ id: number; name: string } | null>(() => {
    // Try to initialize user role immediately from localStorage
    if (typeof window !== 'undefined') {
      const user = authUtils.getUser();
      if (user && user.adminRoleAccess) {
        return {
          id: user.adminRoleAccess.id,
          name: user.adminRoleAccess.roleName,
        };
      }
    }
    return null;
  });
  
  const [initialLoad, setInitialLoad] = useState(true);

  const processUserData = (userData: any) => {
    if (userData && userData.adminRoleAccess && userData.adminRoleAccess.rolePermissions) {
      // Convert API permissions to our format
      const userPermissions = convertApiPermissionsToUserPermissions(userData);
      
      setPermissions(userPermissions);
      
      // Set user role information
      setUserRole({
        id: userData.adminRoleAccess.id,
        name: userData.adminRoleAccess.roleName,
      });
      
      return true;
    }
    return false;
  };

  const fetchPermissions = async () => {
    try {
      // Only show loading state if we don't already have permissions
      if (initialLoad && !permissions) {
        setLoading(true);
      }
      setError(null);
      
      // First, try to get user data from localStorage
      const user = authUtils.getUser();
      if (user && processUserData(user)) {
    
        if (loading) setLoading(false);
        if (initialLoad) setInitialLoad(false);
        return;
      }
      
      // Only make API call if we're authenticated and don't have permissions
      if (!authUtils.isAuthenticated()) {
    
        if (loading) setLoading(false);
        if (initialLoad) setInitialLoad(false);
        return;
      }
      
  
      // If no user in localStorage or missing permission data, fetch from API
      const response = await fetch('/api/auth/me', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...authUtils.getAuthHeaders(),
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch user permissions: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      
      if (!result.success || !result.data) {
        throw new Error('Invalid response format');
      }

      const userData: ApiUserData = result.data;
      
      if (!processUserData(userData)) {
        throw new Error('Invalid user data format');
      }

   

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch permissions';
      setError(errorMessage);
      console.error('Error fetching user permissions:', err);
      
      // If there's an error and we have some user data, set minimal permissions
      const user = authUtils.getUser();
      if (user && authUtils.isAuthenticated()) {
      
        setPermissions({
          tickets: { view: true, create: false, update: false, delete: false },
          jobSeekers: { view: true, create: false, update: false, delete: false },
          employers: { view: true, create: false, update: false, delete: false },
          jobs: { view: true, create: false, update: false, delete: false },
          applications: { view: true, create: false, update: false, delete: false },
          coupons: { view: false, create: false, update: false, delete: false },
          blog: { view: true, create: false, update: false, delete: false },
          careers: { view: true, create: false, update: false, delete: false },
        });
        setError(null); 
      }
    } finally {
      setLoading(false);
      if (initialLoad) setInitialLoad(false);
    }
  };

  useEffect(() => {
    fetchPermissions();
    
    // Listen for auth updates
    const handleAuthUpdate = () => {
      fetchPermissions();
    };
    
    if (typeof window !== 'undefined') {
      window.addEventListener('authUpdate', handleAuthUpdate);
      return () => {
        window.removeEventListener('authUpdate', handleAuthUpdate);
      };
    }
  }, []);

  return {
    permissions,
    loading,
    error,
    refetch: fetchPermissions,
    userRole,
  };
};

export default useAuthPermissions;
