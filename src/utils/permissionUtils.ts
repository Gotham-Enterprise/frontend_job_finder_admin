import { UserPermissions } from "@/services/types/permissions";

interface ApiRolePermission {
  id: string;
  roleId: number;
  permissionId: string;
  add: boolean;
  view: boolean;
  edit: boolean;
  delete: boolean;
  name: string;
  description: string;
  permission?: {
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
    newsLetter: { view: true, create: true, update: true, delete: true },
    unlockRequest: { view: false, create: false, update: false, delete: false },
  };

  const permissionMapping: Record<string, keyof UserPermissions> = {
    "Job Seekers Management": "jobSeekers",
    "Employers Management": "employers",
    "Jobs Management": "jobs",
    "Applications Management": "applications",
    "Blog Management": "blog",
    "Careers Management": "careers",
    "Tickets Management": "tickets",
    "Coupons Management": "coupons",
    "Unlock Requests Management": "unlockRequest",
    // Also support the old format for backward compatibility
    "Job Seekers": "jobSeekers",
    Employers: "employers",
    Jobs: "jobs",
    Applications: "applications",
    Blog: "blog",
    Careers: "careers",
    Tickets: "tickets",
    Coupons: "coupons",
    "News Letter": "newsLetter",
    "Unlock Requests": "unlockRequest",
  };

  // Convert API permissions to our format
  rolePermissions.forEach((apiPermission) => {
    // The API data structure shows the permission name is directly in apiPermission.name, not apiPermission.permission.name
    const permissionName = apiPermission.name || (apiPermission.permission && apiPermission.permission.name);

    if (!permissionName) {
      console.warn("Permission name is missing for:", apiPermission);
      return;
    }

    const moduleName = permissionMapping[permissionName];

    if (moduleName && moduleName in userPermissions) {
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

export function hasAnyModulePermission(permissions: UserPermissions, module: keyof UserPermissions): boolean {
  const modulePermissions = permissions[module];
  return Object.values(modulePermissions).some((permission) => permission);
}

export function hasPermission(
  permissions: UserPermissions,
  module: keyof UserPermissions,
  action: keyof UserPermissions[keyof UserPermissions]
): boolean {
  return permissions[module][action];
}

export function getUserRole(userData: ApiUserData): { id: number; name: string } {
  return {
    id: userData.adminRoleAccess.id,
    name: userData.adminRoleAccess.roleName,
  };
}
