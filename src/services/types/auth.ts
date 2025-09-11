export interface LoginCredentials {
  email: string;
  password: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ForgotPasswordResponse {
  success: boolean;
  message: string;
}

export interface ResetPasswordRequest {
  password: string;
  confirmPassword: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ResetPasswordResponse {
  success: boolean;
  message: string;
}

export interface User {
  id: string;
  email: string;
  username: string;
  password?: string;
  firstName: string;
  lastName: string;
  fullName: string | null;
  suffix: string | null;
  salutation: string | null;
  role: string;
  status: string;
  sendNewsLetter: boolean;
  legacyIsSubscribeToNewsLetter: boolean | null;
  failedLoginAttempts: number;
  accountLocked: boolean;
  lockedUntil: string | null;
  resetPasswordToken: string | null;
  resetPasswordTokenExpires: string | null;
  activationToken: string | null;
  activationTokenExpires: string | null;
  recommendationFrequency: string;
  agreeToTermsAndConditions: boolean;
  createdAt: string;
  emailVerifiedAt: string | null;
  updatedAt: string;
  lastEmailSentAt: string | null;
  userType: string;
  forceChangePassword: boolean;
  candidateProfile: any | null;
  companyUser: any | null;
  profile?: {
    avatarUrl: string | null;
    phoneNumber: string | null;
    address: string | null;
    state: string | null;
    city: string | null;
    zipCode: string | null;
  };
  adminProfile?: {
    id: string;
    avatarUrl: string | null;
    accessRoleId: number;
  };
  missingCandidateDetails?: any[];
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

export interface AuthResponse {
  isAuthenticated: boolean;
  success: boolean;
  data: User;
  token: string;
  refreshToken: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  refreshToken: string | null;
}
