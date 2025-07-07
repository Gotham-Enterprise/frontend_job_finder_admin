"use client";
import Checkbox from "@/components/form/input/Checkbox";
import Label from "@/components/form/Label";
import Input from "@/components/ui/input/Input";
import Button from "@/components/ui/button/Button";
import { EyeCloseIcon, EyeIcon } from "@/icons";
import Link from "next/link";
import React, { useState, FormEvent, useEffect } from "react";
import Image from "next/image";
import { useLogin } from "@/services/hooks/useAuth";
import { useRouter, useSearchParams } from "next/navigation";
import { authUtils } from "@/services/utils/authUtils";

export default function SignInForm() {  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [inactivityMessage, setInactivityMessage] = useState<string | null>(null);
  const [showSessionReset, setShowSessionReset] = useState(false);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const { mutate: login, isPending } = useLogin();

  const sessionReset = async () => {
    try {

      authUtils.forceAuthClear();
      
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/logout`, {
        method: 'GET',
        credentials: 'include',
      }).catch(() => {
       
      });
      
      setErrorMessage(null);
      setShowSessionReset(false);
      setInactivityMessage("Session data has been cleared. Please try logging in again.");
    } catch (error) {
      console.error("Session reset error:", error);
    }
  };
  useEffect(() => {
   
    if (authUtils.isAuthenticated()) {
      router.push('/');
      return;
    }
    
  
    const reason = searchParams.get('reason');
    if (reason === 'inactivity') {
      setInactivityMessage("You have been automatically logged out due to 1 hour of inactivity. Please sign in again.");
    
      authUtils.forceAuthClear();
    }
  }, [router, searchParams]); 

  const errorMappings = [
    {
      patterns: ['Session conflict', 'already logged in', 'You are already logged in'],
      message: "There was a session conflict. We've attempted to resolve it automatically. If the issue persists, try clearing your session data below.",
      showReset: true
    },
    {
      patterns: ['Invalid credentials'],
      message: "Invalid email or password. Please check your credentials and try again."
    },
    {
      patterns: ['Account access denied'],
      message: "Your account access has been denied. Please contact support for assistance."
    },
    {
      patterns: ['Rate limit exceeded'],
      message: "Too many login attempts. Please wait a moment before trying again."
    },
    {
      patterns: ['Server error', 'Service unavailable'],
      message: "The service is temporarily unavailable. Please try again in a few moments."
    },
    {
      patterns: ['Bad request'],
      message: "Invalid login data. Please check your email and password format."
    }
  ];

  const getErrorMessage = (error: Error): { message: string; showReset: boolean } => {
    const errorMessage = error.message || '';
    
    for (const mapping of errorMappings) {
      if (mapping.patterns.some(pattern => errorMessage.includes(pattern))) {
        return {
          message: mapping.message,
          showReset: mapping.showReset || false
        };
      }
    }

    return {
      message: error.message || "Login failed. Please check your credentials.",
      showReset: false
    };
  };

  const loginError = (error: Error) => {
    const { message, showReset } = getErrorMessage(error);
    
    setErrorMessage(message);
    setShowSessionReset(showReset);
  };

  const initSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);
    
    try {
      login({ email, password }, {
        onError: loginError
      });
    } catch (error) {
      console.error("Login error:", error);
      setErrorMessage("An unexpected error occurred. Please try again.");
    }
  };

  return (
    <div className="flex flex-col flex-1 lg:w-1/2 w-full">
   
      <div className="flex flex-col items-center justify-center mt-10 max-w-xs mx-auto lg:hidden">
                <Link href="/" className="block mb-4">
                  <Image
                    width={231}
                    height={48}
                    src="./images/logo/main-logo.svg"
                    alt="Logo"
                  />
                </Link>
              </div>
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
     
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Sign In
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Enter your email and password to sign in!
            </p>
          </div>          <div>
            {inactivityMessage && (
              <div className="p-3 mb-4 text-sm text-blue-600 bg-blue-100 rounded-lg dark:bg-blue-800/20 dark:text-blue-400">
                {inactivityMessage}
              </div>
            )}            {errorMessage && (
              <div className="p-3 mb-4 text-sm text-red-500 bg-red-100 rounded-lg dark:bg-red-800/20 dark:text-red-400">
                {errorMessage}
                {showSessionReset && (
                  <div className="mt-2">
                    <button
                      type="button"
                      onClick={sessionReset}
                      className="text-xs text-blue-600 hover:text-blue-800 underline dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      Clear session data and try again
                    </button>
                  </div>
                )}
              </div>
            )}
            
        
            <form onSubmit={initSubmit}>
              <div className="space-y-6">
                <div>                  <Label>
                    Email <span className="text-error-500">*</span>{" "}
                  </Label>
                  <Input 
                    placeholder="info@gmail.com" 
                    type="email" 
                    value={email}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div>                  
                  <Label>
                    Password <span className="text-error-500">*</span>{" "}
                  </Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                      required
                    />
                    <span
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                    >
                      {showPassword ? (
                        <EyeIcon className="fill-gray-500 dark:fill-gray-400" />
                      ) : (
                        <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400" />
                      )}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Checkbox checked={isChecked} onChange={setIsChecked} />
                    <span className="block font-normal text-gray-700 text-theme-sm dark:text-gray-400">
                      Keep me logged in
                    </span>
                  </div>
                  <Link
                    href="/forgot-password"
                    className="text-sm text-brand-500 hover:text-brand-600 dark:text-brand-400"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div>                  
                  <Button 
                    variant="text-primary" 
                    className="w-full" 
                    size="lg"
                    disabled={isPending}
                  >
                    {isPending ? "Signing in..." : "Sign in"}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
