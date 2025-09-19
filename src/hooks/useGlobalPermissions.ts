import { useCallback } from 'react';
import { UserPermissions } from '@/services/types/permissions';
import { GLOBAL_PERMISSION_CONFIG, getPermissionsForRole, canAccessPath } from '@/config/permissions';

interface UseGlobalPermissionsReturn {
  validateAccess: (permissions: UserPermissions, path: string) => boolean;
  getRolePermissions: (role: string) => UserPermissions;
  filterAccessibleModules: (permissions: UserPermissions) => typeof GLOBAL_PERMISSION_CONFIG.modules;
  hasModuleAccess: (permissions: UserPermissions, moduleKey: keyof UserPermissions, action?: keyof UserPermissions[keyof UserPermissions]) => boolean;
  canPerformAction: (permissions: UserPermissions, moduleKey: keyof UserPermissions, action: keyof UserPermissions[keyof UserPermissions]) => boolean;
  getAccessLevel: (permissions: UserPermissions, moduleKey: keyof UserPermissions) => 'none' | 'read' | 'write' | 'full';
  isAdmin: (permissions: UserPermissions) => boolean;
  isContentManager: (permissions: UserPermissions) => boolean;
  getNavigationItems: (permissions: UserPermissions) => any[];
}

export const useGlobalPermissions = (): UseGlobalPermissionsReturn => {
  const validateAccess = useCallback((permissions: UserPermissions, path: string): boolean => {
    return canAccessPath(permissions, path);
  }, []);

  const getRolePermissions = useCallback((role: string): UserPermissions => {
    return getPermissionsForRole(role);
  }, []);

  const filterAccessibleModules = useCallback((permissions: UserPermissions) => {
    return GLOBAL_PERMISSION_CONFIG.modules.filter(module => 
      permissions[module.key]?.view
    );
  }, []);

  const hasModuleAccess = useCallback((
    permissions: UserPermissions, 
    moduleKey: keyof UserPermissions, 
    action: keyof UserPermissions[keyof UserPermissions] = 'view'
  ): boolean => {
    return permissions[moduleKey]?.[action] || false;
  }, []);

  const canPerformAction = useCallback((
    permissions: UserPermissions,
    moduleKey: keyof UserPermissions,
    action: keyof UserPermissions[keyof UserPermissions]
  ): boolean => {
    return permissions[moduleKey]?.[action] || false;
  }, []);

  const getAccessLevel = useCallback((
    permissions: UserPermissions,
    moduleKey: keyof UserPermissions
  ): 'none' | 'read' | 'write' | 'full' => {
    const modulePerms = permissions[moduleKey];
    
    if (!modulePerms?.view) return 'none';
    if (modulePerms.view && modulePerms.create && modulePerms.update && modulePerms.delete) return 'full';
    if (modulePerms.create || modulePerms.update || modulePerms.delete) return 'write';
    return 'read';
  }, []);

  const isAdmin = useCallback((permissions: UserPermissions): boolean => {
    return Object.values(permissions).every(module =>
      Object.values(module).every(permission => permission)
    );
  }, []);

  const isContentManager = useCallback((permissions: UserPermissions): boolean => {
    return permissions.blog?.create && permissions.careers?.create && !permissions.coupons?.view;
  }, []);

  const getNavigationItems = useCallback((permissions: UserPermissions) => {
    return GLOBAL_PERMISSION_CONFIG.modules
      .filter(module => permissions[module.key]?.view)
      .map(module => ({
        key: module.key,
        name: module.name,
        path: module.path,
        icon: module.icon,
        accessLevel: getAccessLevel(permissions, module.key),
        subItems: module.subItems?.filter(subItem => {
          const requiredPermission = subItem.requiredPermission || 'view';
          return permissions[module.key]?.[requiredPermission];
        }),
      }));
  }, [getAccessLevel]);

  return {
    validateAccess,
    getRolePermissions,
    filterAccessibleModules,
    hasModuleAccess,
    canPerformAction,
    getAccessLevel,
    isAdmin,
    isContentManager,
    getNavigationItems,
  };
};

export default useGlobalPermissions;
