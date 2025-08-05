import { apiGet, apiPost, apiPut, apiDelete } from './apiUtils';

export interface AdminUser {
  userId: string;
  email: string;
  name: string;
  role: string;
  avatarUrl?: string;
  status: 'active' | 'inactive';
  access?: {
    [key: string]: {
      add: boolean;
      edit: boolean;
      view: boolean;
      delete: boolean;
    };
  };
}

export interface CreateAdminUserRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  roleId: number;
  access: {
    [key: string]: {
      add: boolean;
      edit: boolean;
      view: boolean;
      delete: boolean;
    };
  };
}

export interface UpdateAdminUserRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  roleId?: number;
  access?: {
    [key: string]: {
      add: boolean;
      edit: boolean;
      view: boolean;
      delete: boolean;
    };
  };
  avatarUpload?: string;
}

export interface Role {
  id: number;
  roleName: string;
  access: object;
}

export interface RolesResponse {
  success: boolean;
  data: Role[];
}

export interface CreateRoleRequest {
  roleName: string;
}

export interface CreateRoleResponse {
  success: boolean;
  data: {
    id: number;
    roleName: string;
  };
}

export interface AdminUsersResponse {
  success: boolean;
  data: AdminUser[];
}

export interface AdminUserResponse {
  success: boolean;
  data: AdminUser;
}

export interface DeleteUsersRequest {
  userIds: string[];
}

export interface DeleteUsersResponse {
  success: boolean;
  data: any[];
  message: string;
}

export const adminUsersApi = {
  async getUsers(): Promise<AdminUsersResponse> {
    return apiGet<AdminUsersResponse>('/api/admin/users/');
  },

  async getRoles(): Promise<RolesResponse> {
    return apiGet<RolesResponse>('/api/admin/users/roles');
  },

  async createRole(roleData: CreateRoleRequest): Promise<CreateRoleResponse> {
    return apiPost<CreateRoleResponse>('/api/admin/users/roles', roleData);
  },

  async createUser(userData: CreateAdminUserRequest): Promise<AdminUserResponse> {
    return apiPost<AdminUserResponse>('/api/admin/users/', userData);
  },

  async updateUser(userId: string, userData: UpdateAdminUserRequest): Promise<AdminUserResponse> {
    return apiPut<AdminUserResponse>(`/api/admin/users/${userId}`, userData);
  },

  async deleteUsers(userIds: string[]): Promise<DeleteUsersResponse> {
    return apiDelete<DeleteUsersResponse>('/api/admin/users/', { body: { userIds } });
  }
};
