import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { authApi } from '../api/auth';
import { authUtils } from '../utils/authUtils';
import { LoginCredentials, AuthResponse, ForgotPasswordRequest, ResetPasswordRequest } from '../types/auth';

export const useLogin = () => {
  const router = useRouter();

  return useMutation({
    mutationFn: (credentials: LoginCredentials) => authApi.login(credentials),
    onSuccess: (data: AuthResponse) => {
      authUtils.saveAuthState({
        isAuthenticated: data.isAuthenticated,
        user: data.data,
        token: data.token,
        refreshToken: data.refreshToken,
      });
      
      router.push('/admin');
    }
  });
};

export const useLogout = () => {
  const router = useRouter();
  
  return useMutation({
    mutationFn: () => authApi.logout(),
    onSuccess: () => {
      authUtils.forceAuthClear();
      router.push('/login');
    },
    onError: () => {
      authUtils.forceAuthClear();
      router.push('/login');
    }
  });
};

export const useForgotPassword = () => {
  return useMutation({
    mutationFn: (request: ForgotPasswordRequest) => authApi.forgotPassword(request),
    onSuccess: (data) => {
      return data; 
    },
    onError: (error) => {
      return error; 
    }
  });
};

export const useResetPassword = () => {
  return useMutation({
    mutationFn: ({ resetToken, request }: { resetToken: string; request: ResetPasswordRequest }) => 
      authApi.resetPassword(resetToken, request),
    onSuccess: (data) => {
      return data; 
    },
    onError: (error) => {
      return error; 
    }
  });
};
