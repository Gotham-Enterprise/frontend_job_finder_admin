import React, { createContext, useContext, ReactNode } from 'react';
import { useAuthPermissions } from '../hooks/useAuthPermissions';
import { UserPermissions } from '../services/types/permissions';

interface PermissionContextType {
  permissions: UserPermissions | null;
  loading: boolean;
  error: string | null;
  userRole: { id: number; name: string } | null;
  refetch: () => Promise<void>;
}

const PermissionContext = createContext<PermissionContextType | undefined>(undefined);

interface PermissionProviderProps {
  children: ReactNode;
  fallback?: React.ReactNode;
}

export const PermissionProvider: React.FC<PermissionProviderProps> = ({ 
  children,
  fallback 
}) => {
  const authPermissions = useAuthPermissions();

  // Show fallback during initial loading
  if (authPermissions.loading && !authPermissions.permissions && fallback) {
    return <>{fallback}</>;
  }

  return (
    <PermissionContext.Provider value={authPermissions}>
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
