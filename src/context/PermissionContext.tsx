'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { UserPermissions } from '@/services/types/permissions';

interface PermissionContextType {
  permissions: UserPermissions;
  hasPermission: (module: keyof UserPermissions, action: keyof UserPermissions[keyof UserPermissions]) => boolean;
  canViewModule: (module: keyof UserPermissions) => boolean;
  canCreateInModule: (module: keyof UserPermissions) => boolean;
  canUpdateInModule: (module: keyof UserPermissions) => boolean;
  canDeleteInModule: (module: keyof UserPermissions) => boolean;
}

const PermissionContext = createContext<PermissionContextType | undefined>(undefined);

interface PermissionProviderProps {
  children: ReactNode;
  userPermissions: UserPermissions;
}

export const PermissionProvider: React.FC<PermissionProviderProps> = ({
  children,
  userPermissions,
}) => {
  const hasPermission = (
    module: keyof UserPermissions,
    action: keyof UserPermissions[keyof UserPermissions]
  ): boolean => {
    return userPermissions[module][action];
  };

  const canViewModule = (module: keyof UserPermissions): boolean => {
    return hasPermission(module, 'view');
  };

  const canCreateInModule = (module: keyof UserPermissions): boolean => {
    return hasPermission(module, 'create');
  };

  const canUpdateInModule = (module: keyof UserPermissions): boolean => {
    return hasPermission(module, 'update');
  };

  const canDeleteInModule = (module: keyof UserPermissions): boolean => {
    return hasPermission(module, 'delete');
  };

  const value: PermissionContextType = {
    permissions: userPermissions,
    hasPermission,
    canViewModule,
    canCreateInModule,
    canUpdateInModule,
    canDeleteInModule,
  };

  return (
    <PermissionContext.Provider value={value}>
      {children}
    </PermissionContext.Provider>
  );
};

export const usePermissions = (): PermissionContextType => {
  const context = useContext(PermissionContext);
  if (context === undefined) {
    throw new Error('usePermissions must be used within a PermissionProvider');
  }
  return context;
};

export default PermissionProvider;
