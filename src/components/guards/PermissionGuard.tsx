"use client";
import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { authUtils } from '@/services/utils/authUtils';
import NotFoundState from '@/components/common/NotFoundState';

interface PermissionGuardProps {
  children: React.ReactNode;
  requiredPermission?: string;
  requiredAction?: 'view' | 'add' | 'edit' | 'delete';
}

// Helper function to check permission from user data
const hasPermission = (permissionName: string, action: 'view' | 'add' | 'edit' | 'delete' = 'view'): boolean => {
  try {
    const user = authUtils.getUser();
    if (!user || !user.adminRoleAccess || !user.adminRoleAccess.rolePermissions) {
      return false;
    }

    const rolePermissions = user.adminRoleAccess.rolePermissions;
    const permission = rolePermissions.find((p: any) => 
      p.permission.name.toLowerCase().replace(/\s+/g, '') === permissionName.toLowerCase().replace(/\s+/g, '')
    );

    if (!permission) return false;

    switch (action) {
      case 'view': return permission.view;
      case 'add': return permission.add;
      case 'edit': return permission.edit;  
      case 'delete': return permission.delete;
      default: return false;
    }
  } catch (error) {
    console.error('Error checking permission:', error);
    return false;
  }
};

// Route-to-permission mapping
const getPermissionForPath = (pathname: string): { permission: string; action: 'view' | 'add' | 'edit' | 'delete' } | null => {
  if (pathname === '/admin' || pathname === '/admin/') {
    return null; // Dashboard is always accessible
  }
  
  if (pathname.startsWith('/admin/job-seekers')) {
    return { permission: 'jobseekers', action: 'view' };
  }
  
  if (pathname.startsWith('/admin/employers')) {
    return { permission: 'employers', action: 'view' };
  }
  
  if (pathname.startsWith('/admin/jobs')) {
    if (pathname.includes('/create-job') || pathname.includes('/add-new')) {
      return { permission: 'jobs', action: 'add' };
    }
    if (pathname.includes('/edit')) {
      return { permission: 'jobs', action: 'edit' };
    }
    return { permission: 'jobs', action: 'view' };
  }
  
  if (pathname.startsWith('/admin/applications')) {
    return { permission: 'applications', action: 'view' };
  }
  
  if (pathname.startsWith('/admin/careers')) {
    return { permission: 'careers', action: 'view' };
  }
  
  if (pathname.startsWith('/admin/tickets')) {
    return { permission: 'tickets', action: 'view' };
  }
  
  if (pathname.startsWith('/admin/coupons')) {
    return { permission: 'coupons', action: 'view' };
  }
  
  if (pathname.startsWith('/admin/blog')) {
    if (pathname.includes('/add-new') || pathname.includes('/create')) {
      return { permission: 'blog', action: 'add' };
    }
    if (pathname.includes('/edit')) {
      return { permission: 'blog', action: 'edit' };
    }
    return { permission: 'blog', action: 'view' };
  }
  
  return null;
};

const PermissionGuard: React.FC<PermissionGuardProps> = ({ 
  children, 
  requiredPermission, 
  requiredAction = 'view' 
}) => {
  const router = useRouter();
  const pathname = usePathname();
  
  // If specific permission is provided, use that
  if (requiredPermission) {
    if (!hasPermission(requiredPermission, requiredAction)) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <NotFoundState 
            title="Access Denied"
            message="You don't have permission to access this page."
          />
        </div>
      );
    }
    return <>{children}</>;
  }
  
  // Otherwise, check based on the current route
  const pathPermission = getPermissionForPath(pathname);
  
  // If no specific permission is required for this path, allow access
  if (!pathPermission) {
    return <>{children}</>;
  }
  
  // Check if user has the required permission for this path
  if (!hasPermission(pathPermission.permission, pathPermission.action)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <NotFoundState 
          title="Access Denied"
          message="You don't have permission to access this page."
        />
      </div>
    );
  }
  
  return <>{children}</>;
};

export default PermissionGuard;
