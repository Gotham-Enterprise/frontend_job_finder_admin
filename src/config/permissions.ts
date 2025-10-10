import { UserPermissions, Permission } from '@/services/types/permissions';

export interface ModuleConfig {
  key: keyof UserPermissions;
  name: string;
  icon: string;
  description: string;
  path: string;
  subItems?: Array<{
    name: string;
    path: string;
    requiredPermission?: keyof Permission;
  }>;
}

export interface GlobalPermissionConfig {
  modules: ModuleConfig[];
  defaultPermissions: UserPermissions;
  roleBasedPermissions: Record<string, UserPermissions>;
}

export const GLOBAL_PERMISSION_CONFIG: GlobalPermissionConfig = {
  modules: [
    {
      key: 'tickets',
      name: 'Tickets',
      icon: 'TicketIcon',
      description: 'Manage support tickets and customer inquiries',
      path: '/admin/tickets',
    },
    {
      key: 'jobSeekers',
      name: 'Job Seekers',
      icon: 'GroupIcon',
      description: 'Manage job seeker profiles and applications',
      path: '/admin/job-seekers',
    },
    {
      key: 'employers',
      name: 'Employers',
      icon: 'UserCircleIcon',
      description: 'Manage employer accounts and job postings',
      path: '/admin/employers',
    },
    {
      key: 'jobs',
      name: 'Jobs',
      icon: 'BriefcaseIcon',
      description: 'Manage job listings and postings',
      path: '/admin/jobs',
    },
    {
      key: 'applications',
      name: 'Applications',
      icon: 'TaskIcon',
      description: 'Manage job applications and hiring process',
      path: '/admin/applications',
    },
    {
      key: 'coupons',
      name: 'Coupons',
      icon: 'CouponIcon',
      description: 'Manage discount coupons and promotions',
      path: '/admin/coupons',
    },
    {
      key: 'blog',
      name: 'Blog',
      icon: 'BlogIcon',
      description: 'Manage blog posts and content',
      path: '/admin/blog',
      subItems: [
        { name: 'All Posts', path: '/admin/blog', requiredPermission: 'view' },
        { name: 'Add New', path: '/admin/blog/add-new', requiredPermission: 'create' },
        { name: 'Categories', path: '/admin/blog/categories', requiredPermission: 'update' },
        { name: 'Tags', path: '/admin/blog/tags', requiredPermission: 'update' },
        { name: 'Archives', path: '/admin/blog/archives', requiredPermission: 'view' },
      ],
    },
    {
      key: 'careers',
      name: 'Careers',
      icon: 'CareerLadderIcon',
      description: 'Manage career opportunities and job listings',
      path: '/admin/careers',
    },
  ],

  defaultPermissions: {
    tickets: { view: true, create: false, update: false, delete: false },
    jobSeekers: { view: true, create: false, update: false, delete: false },
    employers: { view: true, create: false, update: false, delete: false },
    jobs: { view: true, create: false, update: false, delete: false },
    applications: { view: true, create: false, update: false, delete: false },
    coupons: { view: false, create: false, update: false, delete: false },
    blog: { view: true, create: false, update: false, delete: false },
    careers: { view: true, create: false, update: false, delete: false },
    unlockRequest: { view: false, create: false, update: false, delete: false },
  },

  roleBasedPermissions: {
    admin: {
      tickets: { view: true, create: true, update: true, delete: true },
      jobSeekers: { view: true, create: true, update: true, delete: true },
      employers: { view: true, create: true, update: true, delete: true },
      jobs: { view: true, create: true, update: true, delete: true },
      applications: { view: true, create: true, update: true, delete: true },
      coupons: { view: true, create: true, update: true, delete: true },
      blog: { view: true, create: true, update: true, delete: true },
      careers: { view: true, create: true, update: true, delete: true },
      unlockRequest: { view: true, create: false, update: false, delete: true },
    },
    'super-admin': {
      tickets: { view: true, create: true, update: true, delete: true },
      jobSeekers: { view: true, create: true, update: true, delete: true },
      employers: { view: true, create: true, update: true, delete: true },
      jobs: { view: true, create: true, update: true, delete: true },
      applications: { view: true, create: true, update: true, delete: true },
      coupons: { view: true, create: true, update: true, delete: true },
      blog: { view: true, create: true, update: true, delete: true },
      careers: { view: true, create: true, update: true, delete: true },
      unlockRequest: { view: true, create: false, update: false, delete: true },
    },
  },
};

export const getPermissionsForRole = (role: string): UserPermissions => {
  return GLOBAL_PERMISSION_CONFIG.roleBasedPermissions[role] || GLOBAL_PERMISSION_CONFIG.defaultPermissions;
};

export const getModuleConfig = (moduleKey: keyof UserPermissions): ModuleConfig | undefined => {
  return GLOBAL_PERMISSION_CONFIG.modules.find((moduleConfig) => moduleConfig.key === moduleKey);
};

export const getAllowedModules = (permissions: UserPermissions): ModuleConfig[] => {
  return GLOBAL_PERMISSION_CONFIG.modules.filter((moduleConfig) => permissions[moduleConfig.key].view);
};

export const canAccessPath = (permissions: UserPermissions, path: string): boolean => {
  for (const moduleConfig of GLOBAL_PERMISSION_CONFIG.modules) {
    if (path.startsWith(moduleConfig.path)) {
      return permissions[moduleConfig.key].view;
    }

    if (moduleConfig.subItems) {
      for (const subItem of moduleConfig.subItems) {
        if (path === subItem.path) {
          const requiredPermission = subItem.requiredPermission || 'view';
          return permissions[moduleConfig.key][requiredPermission];
        }
      }
    }
  }
  return false;
};
