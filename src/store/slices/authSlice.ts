import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface User {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  fullName: string | null;
  role: string;
  status: string;
  adminRoleAccess?: {
    id: number;
    roleName: string;
    rolePermissions: RolePermission[];
  };
}

export interface RolePermission {
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

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.error = null;
    },
    clearUser: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.isLoading = false;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const { setLoading, setUser, clearUser, setError, clearError } = authSlice.actions;
export default authSlice.reducer;
