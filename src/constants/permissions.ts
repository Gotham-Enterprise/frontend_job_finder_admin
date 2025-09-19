// Permission modules that map to API permission names
export const PERMISSION_MODULES = {
  DASHBOARD: 'dashboard',
  JOBS: 'jobs',
  JOB_SEEKERS: 'jobseekers',
  EMPLOYERS: 'employers',
  APPLICATIONS: 'applications',
  CAREERS: 'careers',
  TICKETS: 'tickets',
  BLOG: 'blog',
  COUPONS: 'coupons',
  ACCOUNT_SETTINGS: 'users'
} as const;

// Permission actions
export const PERMISSION_ACTIONS = {
  VIEW: 'view',
  ADD: 'add',
  EDIT: 'edit',
  DELETE: 'delete'
} as const;

// Map routes to required permissions
export const PROTECTED_ROUTES = {
  '/admin/dashboard': { module: PERMISSION_MODULES.DASHBOARD, action: PERMISSION_ACTIONS.VIEW },
  '/admin/jobs-admin': { module: PERMISSION_MODULES.JOBS, action: PERMISSION_ACTIONS.VIEW },
  '/admin/job-seekers': { module: PERMISSION_MODULES.JOB_SEEKERS, action: PERMISSION_ACTIONS.VIEW },
  '/admin/employers': { module: PERMISSION_MODULES.EMPLOYERS, action: PERMISSION_ACTIONS.VIEW },
  '/admin/applications': { module: PERMISSION_MODULES.APPLICATIONS, action: PERMISSION_ACTIONS.VIEW },
  '/admin/careers': { module: PERMISSION_MODULES.CAREERS, action: PERMISSION_ACTIONS.VIEW },
  '/admin/tickets': { module: PERMISSION_MODULES.TICKETS, action: PERMISSION_ACTIONS.VIEW },
  '/admin/blog': { module: PERMISSION_MODULES.BLOG, action: PERMISSION_ACTIONS.VIEW },
  '/admin/coupons': { module: PERMISSION_MODULES.COUPONS, action: PERMISSION_ACTIONS.VIEW },
  '/admin/account-settings': { module: PERMISSION_MODULES.ACCOUNT_SETTINGS, action: PERMISSION_ACTIONS.VIEW }
} as const;