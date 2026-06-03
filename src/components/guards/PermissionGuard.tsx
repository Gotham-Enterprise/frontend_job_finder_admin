"use client";
import React from 'react';
import { usePathname } from 'next/navigation';
import { authUtils } from '@/services/utils/authUtils';
import { useAuthPermissions } from '@/hooks/useAuthPermissions';
import { hasPermission, hasAnyModulePermission } from '@/utils/permissionUtils';
import { UserPermissions } from '@/services/types/permissions';
import NotFoundState from '@/components/common/NotFoundState';

interface PermissionGuardProps {
  children: React.ReactNode;
  requiredPermission?: string;
  requiredAction?: 'view' | 'add' | 'edit' | 'delete';
  // New props for the updated permission system
  module?: keyof UserPermissions;
  action?: keyof UserPermissions[keyof UserPermissions];
  fallback?: React.ReactNode;
  showFallback?: boolean;
}

// Legacy helper function to check permission from user data (for backward compatibility)
const hasLegacyPermission = (permissionName: string, action: 'view' | 'add' | 'edit' | 'delete' = 'view'): boolean => {
  try {
    const user = authUtils.getUser();
    if (!user || !user.adminRoleAccess || !user.adminRoleAccess.rolePermissions) {
      return false;
    }

    const rolePermissions = user.adminRoleAccess.rolePermissions;
    
    // Create a mapping for different permission name formats
    const permissionNameMappings: Record<string, string[]> = {
      'jobseekers': ['Job Seekers', 'jobseekers', 'job-seekers'],
      'employers': ['Employers', 'employers'],
      'jobs': ['Jobs', 'jobs'],
      'applications': ['Applications', 'applications'],
      'blog': ['Blog', 'blog'],
      'careers': ['Careers', 'careers'],
      'tickets': ['Tickets', 'tickets'],
      'coupons': ['Coupons', 'coupons']
    };
    
    const possibleNames = permissionNameMappings[permissionName.toLowerCase()] || [permissionName];
    
    const permission = rolePermissions.find((p: any) => {
      // Handle both nested and flat permission structure
      const apiPermissionName = p.permission?.name || p.name;
      return possibleNames.some(name => 
        apiPermissionName.toLowerCase().replace(/\s+/g, '') === name.toLowerCase().replace(/\s+/g, '')
      );
    });

    if (!permission) {
      console.warn(`Permission not found: ${permissionName}. Available permissions:`, rolePermissions.map((p: any) => p.permission?.name || p.name));
      return false;
    }



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
const getPermissionForPath = (pathname: string): { permission: string; action: 'view' | 'add' | 'edit' | 'delete'; module?: keyof UserPermissions; moduleAction?: keyof UserPermissions[keyof UserPermissions] } | null => {
  if (pathname === '/admin' || pathname === '/admin/' || pathname === '/') {
    return null; // Dashboard is always accessible
  }

  // Supervisors / supervisees are always accessible (no backend RBAC module yet for Find Supervisor)
  if (pathname.startsWith('/admin/supervisors') || pathname.startsWith('/admin/supervisees')) {
    return null;
  }
  
  if (pathname.startsWith('/admin/job-seekers')) {
    return { 
      permission: 'jobseekers', 
      action: 'view',
      module: 'jobSeekers',
      moduleAction: 'view'
    };
  }
  
  if (pathname.startsWith('/admin/employers')) {
    return { 
      permission: 'employers', 
      action: 'view',
      module: 'employers',
      moduleAction: 'view'
    };
  }
  
  if (pathname.startsWith('/admin/jobs')) {
    if (pathname.includes('/create-job') || pathname.includes('/add-new')) {
      return { 
        permission: 'jobs', 
        action: 'add',
        module: 'jobs',
        moduleAction: 'create'
      };
    }
    if (pathname.includes('/edit')) {
      return { 
        permission: 'jobs', 
        action: 'edit',
        module: 'jobs',
        moduleAction: 'update'
      };
    }
    return { 
      permission: 'jobs', 
      action: 'view',
      module: 'jobs',
      moduleAction: 'view'
    };
  }
  
  if (pathname.startsWith('/admin/applications')) {
    return { 
      permission: 'applications', 
      action: 'view',
      module: 'applications',
      moduleAction: 'view'
    };
  }
  
  if (pathname.startsWith('/admin/careers')) {
    return { 
      permission: 'careers', 
      action: 'view',
      module: 'careers',
      moduleAction: 'view'
    };
  }
  
  if (pathname.startsWith('/admin/tickets') || pathname.startsWith('/admin/comming-soon')) {
    return { 
      permission: 'tickets', 
      action: 'view',
      module: 'tickets',
      moduleAction: 'view'
    };
  }
  
  if (pathname.startsWith('/admin/coupons')) {
    return { 
      permission: 'coupons', 
      action: 'view',
      module: 'coupons',
      moduleAction: 'view'
    };
  }
  
  if (pathname.startsWith('/admin/blog')) {
    if (pathname.includes('/add-new') || pathname.includes('/create')) {
      return { 
        permission: 'blog', 
        action: 'add',
        module: 'blog',
        moduleAction: 'create'
      };
    }
    if (pathname.includes('/edit')) {
      return { 
        permission: 'blog', 
        action: 'edit',
        module: 'blog',
        moduleAction: 'update'
      };
    }
    return { 
      permission: 'blog', 
      action: 'view',
      module: 'blog',
      moduleAction: 'view'
    };
  }
  
  return null;
};

const PermissionGuard: React.FC<PermissionGuardProps> = ({ 
  children, 
  requiredPermission, 
  requiredAction = 'view',
  module,
  action = 'view',
  fallback,
  showFallback = false
}) => {
  const pathname = usePathname();
  const { permissions, loading, error } = useAuthPermissions();
  

  
  // Show loading state
  if (loading) {

    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  // Show error state
  if (error) {

    return (
      <div className="min-h-screen flex items-center justify-center">
        <NotFoundState 
          title="Error Loading Permissions"
          message="There was an error loading your permissions. Please try refreshing the page."
        />
      </div>
    );
  }

  // If specific module and action are provided (new system), use that
  if (module && permissions) {
    const hasRequiredPermission = hasPermission(permissions, module, action);
    
    if (!hasRequiredPermission) {
      const fallbackContent = fallback || (
        <div className="min-h-screen flex items-center justify-center">
          <NotFoundState 
            title="Access Denied"
            message="You don't have permission to access this page."
          />
        </div>
      );
      
      return showFallback ? <>{fallbackContent}</> : null;
    }
    
    return <>{children}</>;
  }

  // If specific permission is provided (legacy system), use that
  if (requiredPermission) {
    if (!hasLegacyPermission(requiredPermission, requiredAction)) {
      const fallbackContent = fallback || (
        <div className="min-h-screen flex items-center justify-center">
          <NotFoundState 
            title="Access Denied"
            message="You don't have permission to access this page."
          />
        </div>
      );
      
      return showFallback ? <>{fallbackContent}</> : null;
    }
    
    return <>{children}</>;
  }
  
  // Otherwise, check based on the current route
  const pathPermission = getPermissionForPath(pathname);
  

  
  // If no specific permission is required for this path, allow access
  if (!pathPermission) {

    return <>{children}</>;
  }
  
  // Try new permission system first if available
  if (permissions && pathPermission.module && pathPermission.moduleAction) {
    const hasRequiredPermission = hasPermission(permissions, pathPermission.module, pathPermission.moduleAction);
    

    
    if (!hasRequiredPermission) {

      const fallbackContent = fallback || (
        <div className="min-h-screen flex items-center justify-center">
          <NotFoundState 
            title="Access Denied"
            message="You don't have permission to access this page."
          />
        </div>
      );
      
      return showFallback ? <>{fallbackContent}</> : null;
    }
    

    return <>{children}</>;
  }
  
  // Fallback to legacy permission system
  const hasLegacyAccess = hasLegacyPermission(pathPermission.permission, pathPermission.action);

  
  if (!hasLegacyAccess) {

    const fallbackContent = fallback || (
      <div className="min-h-screen flex items-center justify-center">
        <NotFoundState 
          title="Access Denied"
          message="You don't have permission to access this page."
        />
      </div>
    );
    
    return showFallback ? <>{fallbackContent}</> : null;
  }
  

  return <>{children}</>;
};

/**
 * Higher-order component for permission-based rendering
 */
export function withPermission<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  module: keyof UserPermissions,
  action: keyof UserPermissions[keyof UserPermissions],
  fallback?: React.ReactNode,
  showFallback: boolean = false
) {
  const WithPermissionComponent = (props: P) => {
    return (
      <PermissionGuard 
        module={module} 
        action={action} 
        fallback={fallback} 
        showFallback={showFallback}
      >
        <WrappedComponent {...props} />
      </PermissionGuard>
    );
  };

  WithPermissionComponent.displayName = `withPermission(${WrappedComponent.displayName || WrappedComponent.name})`;
  return WithPermissionComponent;
}

/**
 * Hook to check permissions conditionally
 */
export const usePermissionCheck = () => {
  const { permissions, loading, error } = useAuthPermissions();

  const checkPermission = (
    module: keyof UserPermissions,
    action: keyof UserPermissions[keyof UserPermissions]
  ): boolean => {
    if (!permissions || loading || error) return false;
    return hasPermission(permissions, module, action);
  };

  const checkAnyPermission = (module: keyof UserPermissions): boolean => {
    if (!permissions || loading || error) return false;
    return hasAnyModulePermission(permissions, module);
  };

  const checkLegacyPermission = (permissionName: string, action: 'view' | 'add' | 'edit' | 'delete' = 'view'): boolean => {
    return hasLegacyPermission(permissionName, action);
  };

  return {
    checkPermission,
    checkAnyPermission,
    checkLegacyPermission,
    permissions,
    loading,
    error,
  };
};

export default PermissionGuard;
