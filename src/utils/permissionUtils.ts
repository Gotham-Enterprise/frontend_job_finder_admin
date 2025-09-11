import { UserPermissions } from '@/services/types/permissions';

interface ApiRolePermission {
  id: string;
  roleId: number;
  permissionId: string;
  add: boolean;
  view: boolean;
  edit: boolean;
  delete: boolean;
  permission: {
    id: string;
    name: string;
    description: string;
  };
}

interface ApiUserData {
  adminRoleAccess: {
    id: number;
    roleName: string;
    rolePermissions: ApiRolePermission[];
  };
}

/**
 * Convert API permission response to UserPermissions format
 */
export function convertApiPermissionsToUserPermissions(userData: ApiUserData): UserPermissions {
  const rolePermissions = userData.adminRoleAccess.rolePermissions;
  
  // Initialize with default false permissions
  const userPermissions: UserPermissions = {
    tickets: { view: false, create: false, update: false, delete: false },
    jobSeekers: { view: false, create: false, update: false, delete: false },
    employers: { view: false, create: false, update: false, delete: false },
    jobs: { view: false, create: false, update: false, delete: false },
    applications: { view: false, create: false, update: false, delete: false },
    coupons: { view: false, create: false, update: false, delete: false },
    blog: { view: false, create: false, update: false, delete: false },
    careers: { view: false, create: false, update: false, delete: false },
  };

  // Map API permission names to our module keys
  const permissionMapping: Record<string, keyof UserPermissions> = {
    'Job Seekers': 'jobSeekers',
    'Employers': 'employers',
    'Jobs': 'jobs',
    'Applications': 'applications',
    'Blog': 'blog',
    'Careers': 'careers',
    'Tickets': 'tickets',
    'Coupons': 'coupons',
  };

  // Convert API permissions to our format
  rolePermissions.forEach((apiPermission) => {
    const moduleName = permissionMapping[apiPermission.permission.name];
    
    if (moduleName && userPermissions[moduleName]) {
      userPermissions[moduleName] = {
        view: apiPermission.view,
        create: apiPermission.add,
        update: apiPermission.edit,
        delete: apiPermission.delete,
      };
    }
  });

  return userPermissions;
}

/**
 * Check if user has any permission for a module (view, create, update, or delete)
 */
export function hasAnyModulePermission(permissions: UserPermissions, module: keyof UserPermissions): boolean {
  const modulePermissions = permissions[module];
  return Object.values(modulePermissions).some(permission => permission);
}

/**
 * Check if user has specific permission for a module
 */
export function hasPermission(
  permissions: UserPermissions, 
  module: keyof UserPermissions, 
  action: keyof UserPermissions[keyof UserPermissions]
): boolean {
  return permissions[module][action];
}

/**
 * Get user role information
 */
export function getUserRole(userData: ApiUserData): { id: number; name: string } {
  return {
    id: userData.adminRoleAccess.id,
    name: userData.adminRoleAccess.roleName,
  };
}
