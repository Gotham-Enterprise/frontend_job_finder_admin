'use client';

import React, { ReactNode } from 'react';
import { usePermissions } from '@/context/PermissionContext';

interface PermissionGateProps {
  children: ReactNode;
  module: 'tickets' | 'jobSeekers' | 'employers' | 'applications' | 'coupons' | 'blog' | 'careers';
  action?: 'view' | 'create' | 'update' | 'delete';
  fallback?: ReactNode;
  requireAll?: boolean;
}

const PermissionGate: React.FC<PermissionGateProps> = ({
  children,
  module,
  action = 'view',
  fallback = null,
  requireAll = false,
}) => {
  const { hasPermission, canViewModule } = usePermissions();

  const checkPermission = (): boolean => {
    if (requireAll) {
      return canViewModule(module) && hasPermission(module, action);
    }
    
    return hasPermission(module, action);
  };

  if (!checkPermission()) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

export default PermissionGate;
