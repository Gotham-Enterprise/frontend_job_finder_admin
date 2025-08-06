export interface Permission {
  view: boolean;
  create: boolean;
  update: boolean;
  delete: boolean;
}

export interface UserPermissions {
  tickets: Permission;
  jobSeekers: Permission;
  employers: Permission;
  applications: Permission;
  coupons: Permission;
  blog: Permission;
  careers: Permission;
}


export interface FlexiblePermissions {
  [key: string]: {
    add: boolean;
    edit: boolean;
    view: boolean;
    delete: boolean;
  };
}

export interface CreateUserFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: string;
  permissions: FlexiblePermissions;
}

export interface PermissionModule {
  key: keyof UserPermissions;
  label: string;
}

export const PERMISSION_MODULES: PermissionModule[] = [
  { key: 'tickets', label: 'Tickets' },
  { key: 'jobSeekers', label: 'Job Seekers' },
  { key: 'employers', label: 'Employers' },
  { key: 'applications', label: 'Applications' },
  { key: 'coupons', label: 'Coupons' },
  { key: 'blog', label: 'Blog' },
  { key: 'careers', label: 'Careers' },
];

export const DEFAULT_PERMISSIONS: FlexiblePermissions = {};

export const ROLE_OPTIONS = [
  { value: 'admin', label: 'Admin' },
  { value: 'manager', label: 'Manager' },
  { value: 'user', label: 'User' },
  { value: 'content-manager', label: 'Content Manager' },
  { value: 'viewer', label: 'Viewer' },
];
