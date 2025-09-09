import { useCallback } from 'react';
import { UserPermissions } from '@/services/types/permissions';

interface UseUserPermissionsReturn {
  checkPermission: (
    permissions: UserPermissions,
    module: keyof UserPermissions,
    action: keyof UserPermissions[keyof UserPermissions]
  ) => boolean;
  hasAnyPermission: (permissions: UserPermissions, module: keyof UserPermissions) => boolean;
  getActivePermissions: (permissions: UserPermissions, module: keyof UserPermissions) => string[];
  isFullAccess: (permissions: UserPermissions) => boolean;
  isReadOnlyAccess: (permissions: UserPermissions) => boolean;
}

export const useUserPermissions = (): UseUserPermissionsReturn => {
  const checkPermission = useCallback((
    permissions: UserPermissions,
    module: keyof UserPermissions,
    action: keyof UserPermissions[keyof UserPermissions]
  ): boolean => {
    return permissions[module][action];
  }, []);

  const hasAnyPermission = useCallback((
    permissions: UserPermissions,
    module: keyof UserPermissions
  ): boolean => {
    const modulePermissions = permissions[module];
    return Object.values(modulePermissions).some(permission => permission);
  }, []);

  const getActivePermissions = useCallback((
    permissions: UserPermissions,
    module: keyof UserPermissions
  ): string[] => {
    const modulePermissions = permissions[module];
    return Object.entries(modulePermissions)
      .filter(([_, value]) => value)
      .map(([key, _]) => key);
  }, []);

  const isFullAccess = useCallback((permissions: UserPermissions): boolean => {
    return Object.values(permissions).every(module =>
      Object.values(module).every(permission => permission)
    );
  }, []);

  const isReadOnlyAccess = useCallback((permissions: UserPermissions): boolean => {
    return Object.values(permissions).every(module =>
      module.view && !module.create && !module.update && !module.delete
    );
  }, []);

  return {
    checkPermission,
    hasAnyPermission,
    getActivePermissions,
    isFullAccess,
    isReadOnlyAccess,
  };
};

export default useUserPermissions;
