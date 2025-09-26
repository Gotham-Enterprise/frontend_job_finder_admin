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
  jobs: Permission;
  applications: Permission;
  coupons: Permission;
  blog: Permission;
  careers: Permission;
  newsLetter: Permission;
}

export interface CreateUserFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: string;
  permissions: UserPermissions;
}

export interface PermissionModule {
  key: keyof UserPermissions;
  label: string;
}

export const PERMISSION_MODULES: PermissionModule[] = [
  { key: "tickets", label: "Tickets" },
  { key: "jobSeekers", label: "Job Seekers" },
  { key: "employers", label: "Employers" },
  { key: "jobs", label: "Jobs" },
  { key: "applications", label: "Applications" },
  { key: "coupons", label: "Coupons" },
  { key: "blog", label: "Blog" },
  { key: "careers", label: "Careers" },
  { key: "newsLetter", label: "News Letter" },
];

export const DEFAULT_PERMISSIONS: UserPermissions = {
  tickets: { view: true, create: false, update: false, delete: false },
  jobSeekers: { view: true, create: false, update: false, delete: false },
  employers: { view: true, create: false, update: false, delete: false },
  jobs: { view: true, create: false, update: false, delete: false },
  applications: { view: true, create: false, update: false, delete: false },
  coupons: { view: true, create: false, update: false, delete: false },
  blog: { view: true, create: false, update: false, delete: false },
  careers: { view: true, create: false, update: false, delete: false },
  newsLetter: { view: true, create: true, update: true, delete: true },
};

export const ROLE_OPTIONS = [
  { value: "manager", label: "Manager" },
  { value: "user", label: "User" },
  { value: "content-manager", label: "Content Creator" },
  { value: "viewer", label: "Viewer" },
];
