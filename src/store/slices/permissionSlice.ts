import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RolePermission } from './authSlice';

export interface PermissionState {
  permissions: Record<string, PermissionDetail>;
  isLoading: boolean;
}

export interface PermissionDetail {
  add: boolean;
  view: boolean;
  edit: boolean;
  delete: boolean;
  name: string;
  description: string;
}

const initialState: PermissionState = {
  permissions: {},
  isLoading: false,
};

// Permission name mapping to match API response
const PERMISSION_NAME_MAP: Record<string, string> = {
  'Job Seekers': 'jobSeekers',
  'Employers': 'employers',
  'Jobs': 'jobs',
  'Applications': 'applications',
  'Blog': 'blog',
  'Careers': 'careers',
  'Tickets': 'tickets',
  'Coupons': 'coupons',
};

const permissionSlice = createSlice({
  name: 'permission',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setPermissions: (state, action: PayloadAction<RolePermission[]>) => {
      const permissions: Record<string, PermissionDetail> = {};
      
      action.payload.forEach((rolePermission) => {
        const permissionKey = PERMISSION_NAME_MAP[rolePermission.permission.name] || 
          rolePermission.permission.name.toLowerCase().replace(/\s+/g, '');
        
        permissions[permissionKey] = {
          add: rolePermission.add,
          view: rolePermission.view,
          edit: rolePermission.edit,
          delete: rolePermission.delete,
          name: rolePermission.permission.name,
          description: rolePermission.permission.description,
        };
      });
      
      state.permissions = permissions;
    },
    clearPermissions: (state) => {
      state.permissions = {};
    },
  },
});

export const { setLoading, setPermissions, clearPermissions } = permissionSlice.actions;
export default permissionSlice.reducer;
