import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/store';

// Define the permission structure based on API response
interface PermissionDetail {
  add: boolean;
  view: boolean;
  edit: boolean;
  delete: boolean;
  name: string;
  description: string;
}

export const usePermissionStore = () => {
  const permissions = useSelector((state: RootState) => state.permission?.permissions || {});
  const isLoading = useSelector((state: RootState) => state.permission?.isLoading || false);
  
  const hasPermission = (module: string, action: 'view' | 'add' | 'edit' | 'delete'): boolean => {
    const permission = permissions[module] as PermissionDetail;
    if (!permission) return false;
    return permission[action];
  };

  const canViewModule = (module: string): boolean => {
    return hasPermission(module, 'view');
  };

  const canCreateInModule = (module: string): boolean => {
    return hasPermission(module, 'add');
  };

  const canUpdateInModule = (module: string): boolean => {
    return hasPermission(module, 'edit');
  };

  const canDeleteInModule = (module: string): boolean => {
    return hasPermission(module, 'delete');
  };

  const getPermission = (module: string): PermissionDetail | null => {
    return (permissions[module] as PermissionDetail) || null;
  };

  const getAllPermissions = () => {
    return permissions;
  };

  return {
    permissions,
    isLoading,
    hasPermission,
    canViewModule,
    canCreateInModule,
    canUpdateInModule,
    canDeleteInModule,
    getPermission,
    getAllPermissions,
  };
};

export const useAuthStore = () => {
  const user = useSelector((state: RootState) => state.auth?.user || null);
  const isAuthenticated = useSelector((state: RootState) => state.auth?.isAuthenticated || false);
  const isLoading = useSelector((state: RootState) => state.auth?.isLoading || false);
  const error = useSelector((state: RootState) => state.auth?.error || null);

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
  };
};

export const useAppDispatch = () => useDispatch<AppDispatch>();
