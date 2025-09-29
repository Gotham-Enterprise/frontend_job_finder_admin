"use client";
import React from 'react';
import { usePermissions } from '@/hooks/usePermissions';

interface PermissionWrapperProps {
  children: React.ReactNode;
  module: string;
  action: 'view' | 'add' | 'edit' | 'delete';
  fallback?: React.ReactNode;
}

const PermissionWrapper: React.FC<PermissionWrapperProps> = ({ 
  children, 
  module, 
  action, 
  fallback = null 
}) => {
  const { hasPermission } = usePermissions();
  
  if (!hasPermission(module, action)) {
    return <>{fallback}</>;
  }
  
  return <>{children}</>;
};

export default PermissionWrapper;
