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
  forum: Permission;
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
  role: string;
  permissions: FlexiblePermissions;
}

export interface PermissionModule {
  key: keyof UserPermissions;
  label: string;
}

export const PERMISSION_MODULES: PermissionModule[] = [
  { key: "tickets", label: "Tickets" },
  { key: "jobSeekers", label: "Job Seekers" },
  { key: "employers", label: "Employers" },
  { key: "applications", label: "Applications" },
  { key: "coupons", label: "Coupons" },
  { key: "blog", label: "Blog" },
  { key: "careers", label: "Careers" },
  { key: "forum", label: "Forum" },
];

export const DEFAULT_PERMISSIONS: FlexiblePermissions = {
  tickets: { view: false, add: false, edit: false, delete: false },
  jobSeekers: { view: false, add: false, edit: false, delete: false },
  employers: { view: false, add: false, edit: false, delete: false },
  applications: { view: false, add: false, edit: false, delete: false },
  coupons: { view: false, add: false, edit: false, delete: false },
  blog: { view: false, add: false, edit: false, delete: false },
  careers: { view: false, add: false, edit: false, delete: false },
  forum: { view: false, add: false, edit: false, delete: false },
};

export const ROLE_OPTIONS: { value: string; label: string }[] = [
  { value: "manager", label: "Manager" },
  { value: "user", label: "User" },
  { value: "content-manager", label: "Content Creator" },
  { value: "viewer", label: "Viewer" },
  // Super Admin option has been removed - users cannot select this role
];
