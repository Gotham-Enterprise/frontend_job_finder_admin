'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Input from '@/components/ui/input/Input';
import Button from '@/components/ui/button/Button';
import Label from '@/components/form/Label';
import { useForgotPassword } from '@/services/hooks/useAuth';
import { showToast } from '@/services/utils/toast';

const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export default function ForgotPassword() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const { mutate: forgotPassword, isPending } = useForgotPassword();
  
  const isFormValid = email.trim() !== '' && isValidEmail(email);

  const initSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;
    
    forgotPassword(
      { email: email.trim() },
      {
        onSuccess: (data) => {
          showToast.success('Reset Email Sent', 
            data.message || 'Please check your email for password reset instructions.');
          setEmail(''); 
        },
        onError: (error: any) => {
          let errorMessage = 'Failed to send reset password email. Please try again.';
          
          if (error?.originalMessage) {
            errorMessage = error.originalMessage;
          } else if (error?.message) {
            errorMessage = error.message;
          }
          
          showToast.error('Reset Password Failed', errorMessage);
          console.error('Forgot password error:', error);
        }
      }
    );
  };

  const backToLogin = () => {
    router.push('/login');
  };

  return (
    <>
      <section className="flex flex-col flex-1 lg:w-1/2 w-full">
        <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
          <div className="w-full p-6 bg-white md:mt-0 sm:max-w-md dark:bg-gray-800 dark:border-gray-700 sm:p-8">
            <h1 className="mb-1 text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
              Forgot your password?
            </h1>
            <p className="font-light text-gray-500 dark:text-gray-400">
              Just type in your email and we will send you a code to reset your password!
            </p>
            <form className="mt-4 space-y-4 lg:mt-5 md:space-y-5" onSubmit={initSubmit}>
              <div>
                <Label htmlFor="email">Your email</Label>
                <Input 
                  type="email" 
                  name="email" 
                  id="email" 
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                {email && !isValidEmail(email) && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    Please enter a valid email address
                  </p>
                )}
              </div>
             
              <div className="flex gap-3">
                <Button 
                  className="flex-1"
                  disabled={!isFormValid || isPending}
                >
                  {isPending ? 'Sending...' : 'Reset password'}
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
    </>
  );
}