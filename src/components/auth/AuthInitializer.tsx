"use client";
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setUser, setLoading } from '@/store/slices/authSlice';
import { setPermissions } from '@/store/slices/permissionSlice';
import { authUtils } from '@/services/utils/authUtils';

const AuthInitializer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const dispatch = useDispatch();

  useEffect(() => {
    // Initialize auth state from localStorage on app startup
    console.log('AuthInitializer: Starting auth initialization');
    dispatch(setLoading(true));
    
    try {
      console.log('AuthInitializer: Checking if authenticated');
      if (authUtils.isAuthenticated()) {
        console.log('AuthInitializer: User is authenticated, getting user data');
        const user = authUtils.getUser();
        
        if (user) {
          console.log('AuthInitializer: User data found:', {
            name: user.firstName + ' ' + user.lastName,
            email: user.email,
            hasAdminRoleAccess: !!user.adminRoleAccess,
            permissionsCount: user.adminRoleAccess?.rolePermissions?.length || 0
          });
          
          // Set user data in Redux store
          dispatch(setUser(user));
          
          // Extract and set permissions if available
          if (user.adminRoleAccess?.rolePermissions) {
            console.log('AuthInitializer: Setting permissions in Redux');
            dispatch(setPermissions(user.adminRoleAccess.rolePermissions));
            
            // Log each permission for debugging
            user.adminRoleAccess.rolePermissions.forEach(p => {
              console.log('Permission:', p.permission.name, 'view:', p.view, 'add:', p.add, 'edit:', p.edit, 'delete:', p.delete);
            });
          }
          
          console.log('Auth initialized with user:', user.firstName, user.lastName);
          console.log('Permissions loaded:', user.adminRoleAccess?.rolePermissions?.length || 0);
        } else {
          console.log('AuthInitializer: No user data found despite authentication');
        }
      } else {
        console.log('AuthInitializer: No authenticated user found');
      }
    } catch (error) {
      console.error('AuthInitializer: Error initializing auth state:', error);
    } finally {
      dispatch(setLoading(false));
      console.log('AuthInitializer: Initialization complete');
    }
  }, [dispatch]);

  return <>{children}</>;
};

export default AuthInitializer;
