"use client";

import React, { createContext, useContext, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { authUtils } from '@/services/utils/authUtils';
import { useLogout } from '@/services/hooks/useAuth';

interface AutoLogoutContextType {
  resetInactivityTimer: () => void;
}

const AutoLogoutContext = createContext<AutoLogoutContextType | undefined>(undefined);

export const useAutoLogout = () => {
  const context = useContext(AutoLogoutContext);
  if (!context) {
    throw new Error('useAutoLogout must be used within an AutoLogoutProvider');
  }
  return context;
};

interface AutoLogoutProviderProps {
  children: React.ReactNode;
}

const INACTIVITY_TIMEOUT = 1 * 60 * 60 * 1000; 
const LAST_ACTIVITY_KEY = 'jobfinder_last_activity';

export const AutoLogoutProvider: React.FC<AutoLogoutProviderProps> = ({ children }) => {
  const router = useRouter();
  const { mutate: logout } = useLogout();
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<number>(Date.now());

  const updateLastActivity = () => {
    const now = Date.now();
    lastActivityRef.current = now;
    if (typeof window !== 'undefined') {
      localStorage.setItem(LAST_ACTIVITY_KEY, now.toString());
    }
  };
  const checkInactivity = () => {
    if (typeof window === 'undefined') return;
    
    const lastActivity = localStorage.getItem(LAST_ACTIVITY_KEY);
    const currentTime = Date.now();
    
    if (lastActivity) {
      const timeSinceLastActivity = currentTime - parseInt(lastActivity, 10);
        if (timeSinceLastActivity >= INACTIVITY_TIMEOUT) {
        performAutoLogout();
        return;
      }
    }
  };  const performAutoLogout = async () => {
    if (!authUtils.isAuthenticated()) return;
     
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }
    
    authUtils.clearAuthState();
    
    if (typeof window !== 'undefined') {
      localStorage.removeItem(LAST_ACTIVITY_KEY);
    }
    
    try {
      await logout();
    } catch (error) {

      console.warn('Auto-logout: Backend logout failed, but frontend state was cleared:', error);
    }

    router.replace('/login?reason=inactivity');
  };

  const resetInactivityTimer = () => {
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }

    updateLastActivity();    inactivityTimerRef.current = setTimeout(() => {
      performAutoLogout();
    }, INACTIVITY_TIMEOUT);
  };

  const userActivity = () => {
    if (authUtils.isAuthenticated()) {
      resetInactivityTimer();
    }
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!authUtils.isAuthenticated()) {
      return;
    }
    checkInactivity();
    if (authUtils.isAuthenticated()) {
      resetInactivityTimer();
      const events = [
        'mousedown',
        'mousemove',
        'keypress',
        'scroll',
        'touchstart',
        'click',
        'keydown'
      ];

      events.forEach(event => {
        document.addEventListener(event, userActivity, true);
      });

      const storageChange = (e: StorageEvent) => {
        if (e.key === 'jobfinder_auth' && !e.newValue) {
          router.replace('/login');
        }
      };

      window.addEventListener('storage', storageChange);
      return () => {
        if (inactivityTimerRef.current) {
          clearTimeout(inactivityTimerRef.current);
        }
        
        events.forEach(event => {
          document.removeEventListener(event, userActivity, true);
        });

        window.removeEventListener('storage', storageChange);
      };
    }
  }, [router]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const interval = setInterval(() => {
      if (authUtils.isAuthenticated()) {
        checkInactivity();
      }
    }, 60000); 

    return () => clearInterval(interval);
  }, []);

  const contextValue: AutoLogoutContextType = {
    resetInactivityTimer,
  };

  return (
    <AutoLogoutContext.Provider value={contextValue}>
      {children}
    </AutoLogoutContext.Provider>
  );
};
