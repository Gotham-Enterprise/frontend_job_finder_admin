import { useMutation, useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { authApi } from '../api/auth';
import { authUtils } from '../utils/authUtils';
import { LoginCredentials, AuthResponse, ForgotPasswordRequest, ResetPasswordRequest, ChangePasswordRequest } from '../types/auth';

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
    mutationFn: (request: ChangePasswordRequest) => 
      authApi.changePassword(request),
    onSuccess: (data) => {
      return data; 
    },
    onError: (error) => {
      return error; 
    }
  });
};

export const useTokenResetPassword = () => {
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

export const useCurrentUser = () => {
  return useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const response = await authApi.getCurrentUser();
      // Update the stored auth state with fresh user data
      const userData = response?.data || response?.user || response;
      if (userData) {
        authUtils.updateUser(userData);
      }
      return response;
    },
    enabled: authUtils.isAuthenticated(), // Only fetch if user is authenticated
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: (failureCount, error: any) => {
      // Don't retry if it's an auth error
      if (error?.response?.status === 401 || error?.response?.status === 403) {
        return false;
      }
      return failureCount < 2;
    },
    throwOnError: (error: any) => {
      console.error('Failed to fetch current user:', error);
      // If token is invalid, clear auth state
      if (error?.response?.status === 401) {
        authUtils.clearAuthState();
        return false; // Don't throw, just clear auth
      }
      return false; // Don't throw errors
    },
  });
};
