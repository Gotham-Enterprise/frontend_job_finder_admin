import { AdminUser } from '@/services/api/adminUsers';
import { FlexiblePermissions } from '@/types/permissions';

export const getUserInitials = (name: string): string => {
  if (!name || typeof name !== 'string') return 'U';
  const nameParts = name.trim().split(' ');
  if (nameParts.length >= 2) {
    return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

export const formatUserRole = (role: string): string => {
  return role.replace(/-/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
};

export const getUserStatusVariant = (status: AdminUser['status']) => {
  switch (status) {
    case 'active':
      return {
        className: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
        label: 'Active'
      };
    case 'inactive':
      return {
        className: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400',
        label: 'Inactive'
      };
    default:
      return {
        className: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400',
        label: 'Unknown'
      };
  }
};

export const getRoleColor = (role: string): string => {
  const roleColorMap: Record<string, string> = {
    admin: 'text-purple-600 bg-purple-100 dark:bg-purple-900/20 dark:text-purple-400',
    manager: 'text-blue-600 bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400',
    user: 'text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-400',
    'content-manager': 'text-orange-600 bg-orange-100 dark:bg-orange-900/20 dark:text-orange-400',
    viewer: 'text-gray-600 bg-gray-100 dark:bg-gray-900/20 dark:text-gray-400',
  };
  
  return roleColorMap[role.toLowerCase()] || roleColorMap.user;
};

export const transformApiUserToFormData = (user: AdminUser, apiRoles: { id: number; roleName: string; access: object }[] = []): {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: string;
  permissions: FlexiblePermissions;
} => {
  const nameParts = user.name.split(' ');
  
  // Dynamically map API role name to form role value
  const roleValueMap: { [key: string]: string } = {};
  apiRoles.forEach(role => {
    roleValueMap[role.roleName] = role.roleName.toLowerCase().replace(/\s+/g, '-');
  });
  
  // Extract access permissions dynamically from the API response
  const permissions: any = {};
  
  if (user.access) {
    Object.keys(user.access).forEach(moduleKey => {
      // Map API module names to our form structure
      const keyMap: { [key: string]: string } = {
        'Job Seekers': 'jobSeekers',
        'Tickets': 'tickets',
        'Employers': 'employers',
        'Applications': 'applications',
        'Coupons': 'coupons',
        'Blog': 'blog',
        'Careers': 'careers',
        'Jobs': 'jobs',
      };
      
      const mappedKey = keyMap[moduleKey] || moduleKey.toLowerCase().replace(/\s+/g, '');
      
      permissions[mappedKey] = {
        view: user.access?.[moduleKey]?.view || false,
        add: user.access?.[moduleKey]?.add || false,
        edit: user.access?.[moduleKey]?.edit || false,
        delete: user.access?.[moduleKey]?.delete || false,
      };
    });
  }
  
  return {
    firstName: nameParts[0] || '',
    lastName: nameParts.slice(1).join(' ') || '',
    email: user.email,
    password: '', // Password field for editing (will be optional in API)
    role: roleValueMap[user.role] || user.role.toLowerCase().replace(/\s+/g, '-'),
    permissions
  };
};
