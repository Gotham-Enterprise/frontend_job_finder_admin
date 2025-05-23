import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { authApi } from '../api/auth';
import { authUtils } from '../utils/authUtils';
import { LoginCredentials, AuthResponse } from '../types/auth';

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
      authUtils.clearAuthState();
      router.push('/login');
    },
    onError: () => {
      
      authUtils.clearAuthState();
      router.push('/login');
    }
  });
};
