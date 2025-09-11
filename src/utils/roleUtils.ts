export interface UserRole {
  id: number;
  roleName: string;
  rolePermissions?: any[];
}

export interface User {
  id: string;
  role: string;
  adminRoleAccess?: UserRole;
  [key: string]: any;
}

export const ADMIN_ROLES = [
  'super admin',
  'Super Admin',
  'SUPER ADMIN'
] as const;

export const REGULAR_ADMIN_ROLES = [
  'admin',
  'Admin', 
  'ADMIN'
] as const;

export const ALL_ADMIN_ROLES = [...ADMIN_ROLES, ...REGULAR_ADMIN_ROLES] as const;

export const hasAdminAccess = (user: User | null | undefined): boolean => {
  if (!user) {
    console.log('hasAdminAccess: No user provided');
    return false;
  }
  
  // Get the actual operational role - prioritize adminRoleAccess.roleName
  const operationalRole = user.adminRoleAccess?.roleName || user.role;
  
  // Check if the operational role matches any admin role
  if (operationalRole && ALL_ADMIN_ROLES.some(adminRole => 
    adminRole.toLowerCase() === operationalRole.toLowerCase()
  )) {
  
    return true;
  }
  
  return false;
};

export const canAccessUsersTab = (user: User | null | undefined): boolean => {
  return hasAdminAccess(user);
};


export const getUserRoleDisplayName = (user: User | null | undefined): string => {
  if (!user) return 'Unknown';
  return user.adminRoleAccess?.roleName || user.role || 'Unknown';
};
