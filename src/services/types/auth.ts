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

export interface UpdateProfileRequest {
  firstName: string;
  lastName: string;
  email: string;
  username?: string;
  avatarUpload?: File;
}

export interface ResetPasswordResponse {
  success: boolean;
  message: string;
}

export interface User {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  suffix: string | null;
  salutation: string | null;
  role: string;
  status: string;
  sendNewsLetter: boolean;
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
  updatedAt: string;
  lastEmailSentAt: string | null;
  userType: string;
  forceChangePassword: boolean;
  avatarUrl?: string;
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
