"use client";
import { useMemo } from 'react';
import { authUtils } from '@/services/utils/authUtils';

export const usePermissions = () => {
  const permissions = useMemo(() => {
    try {
      const user = authUtils.getUser();
      if (!user?.adminRoleAccess?.rolePermissions) {
        return {};
      }

      const permissionsMap: Record<string, { add: boolean; view: boolean; edit: boolean; delete: boolean }> = {};
      
      user.adminRoleAccess.rolePermissions.forEach((rolePermission: any) => {
        // Handle both nested and flat permission structure
        const permissionName = rolePermission.permission?.name || rolePermission.name;
        if (permissionName) {
          const permissionKey = permissionName.toLowerCase().replace(/\s+/g, '');
          permissionsMap[permissionKey] = {
            add: rolePermission.add,
            view: rolePermission.view,
            edit: rolePermission.edit,
            delete: rolePermission.delete,
          };
          
          // Debug logging
          if (permissionKey === 'jobseekers') {
            console.log('Job Seekers Permission:', {
              key: permissionKey,
              permissions: permissionsMap[permissionKey]
            });
          }
        }
      });

      console.log('All permissions:', permissionsMap);

      return permissionsMap;
    } catch (error) {
      console.error('Error getting permissions:', error);
      return {};
    }
  }, []);

  const hasPermission = (module: string, action: 'view' | 'add' | 'edit' | 'delete'): boolean => {
    const permission = permissions[module];
    
    // Debug logging for jobseekers
    if (module === 'jobseekers') {
      console.log(`Checking permission for ${module}.${action}:`, {
        permission,
        result: permission ? permission[action] : false
      });
    }
    
    if (!permission) return false;
    return permission[action];
  };

  const canView = (module: string): boolean => hasPermission(module, 'view');
  const canAdd = (module: string): boolean => hasPermission(module, 'add');
  const canEdit = (module: string): boolean => hasPermission(module, 'edit');
  const canDelete = (module: string): boolean => hasPermission(module, 'delete');

  return {
    permissions,
    hasPermission,
    canView,
    canAdd,
    canEdit,
    canDelete,
  };
};
