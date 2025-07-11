'use client';

import React, { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Input from '@/components/ui/input/Input';
import Button from '@/components/ui/button/Button';
import Label from '@/components/form/Label';
import { useTokenResetPassword } from '@/services/hooks/useAuth';
import { showToast } from '@/services/utils/toast';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const router = useRouter();
  const params = useParams();
  const resetToken = params.token as string;

  const { mutate: resetPassword, isPending } = useTokenResetPassword();

  const isFormValid = password.length >= 8 && confirmPassword.length >= 8 && password === confirmPassword;

  const initSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isFormValid) {
      showToast.error('Validation Error', 'Please ensure passwords match and are at least 8 characters long.');
      return;
    }

    if (!resetToken) {
      showToast.error('Error', 'Invalid reset token. Please try again.');
      return;
    }

    resetPassword(
      { 
        resetToken, 
        request: { password, confirmPassword } 
      },
      {
        onSuccess: (data) => {
          showToast.success('Success', data.message || 'Password reset successfully!');
          router.push('/login');
        },
        onError: (error: any) => {
          const errorMessage = error?.response?.data?.message || error?.message || 'Password reset failed. Please try again.';
          showToast.error('Reset Error', errorMessage);
        }
      }
    );
  };

  const backToLogin = () => {
    router.push('/login');
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <section className="flex flex-col flex-1 lg:w-1/2 w-full">
        <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
          <div className="w-full p-6 bg-white md:mt-0 sm:max-w-md dark:bg-gray-800 dark:border-gray-700 sm:p-8">
            <h1 className="mb-1 text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
              Reset password?
            </h1>
            <p className="font-light text-gray-500 dark:text-gray-400">
              Please enter your new password and confirm it.
            </p>
         
            <form className="mt-4 space-y-4 lg:mt-5 md:space-y-5" onSubmit={initSubmit}>
              <div>
                <Label htmlFor="password">New Password</Label>
                <div className="relative">
                  <Input 
                    type={showPassword ? "text" : "password"}
                    name="password" 
                    id="password" 
                    placeholder="Enter new password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
                    onClick={togglePasswordVisibility}
                  >
                    {showPassword ? (
                      <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                      </svg>
                    )}
                  </button>
                </div>
                {password && password.length < 8 && (
                  <p className="mt-1 text-sm text-red-600">Password must be at least 8 characters long</p>
                )}
              </div>

              <div>
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <div className="relative">
                  <Input 
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword" 
                    id="confirmPassword" 
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={8}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
                    onClick={toggleConfirmPasswordVisibility}
                  >
                    {showConfirmPassword ? (
                      <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                      </svg>
                    )}
                  </button>
                </div>
                {confirmPassword && password !== confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">Passwords do not match</p>
                )}
              </div>
             
              <div className="flex gap-3">
                <Button 
                  className="flex-1"
                  disabled={!isFormValid || isPending}
                >
                  {isPending ? 'Resetting...' : 'Submit'}
                </Button>
                <Button 
                  variant='ghost'
                  className="flex-1 text-blue-500"
                  onClick={backToLogin}
                >
                  Return to login
                </Button>
              </div>
            </form>
          </div>
        </div>
      </section>
  );
}