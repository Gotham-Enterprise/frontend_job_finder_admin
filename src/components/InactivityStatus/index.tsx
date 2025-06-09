"use client";

import React, { useState, useEffect } from 'react';
import { authUtils } from '@/services/utils/authUtils';

interface InactivityStatusProps {
  className?: string;
  showWarning?: boolean;
  warningThreshold?: number;
}

const INACTIVITY_TIMEOUT = 1 * 60 * 60 * 1000; 
const LAST_ACTIVITY_KEY = 'jobfinder_last_activity';

export const InactivityStatus: React.FC<InactivityStatusProps> = ({
  className = '',
  showWarning = true,
  warningThreshold = 0.25 
}) => {
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [showWarningMessage, setShowWarningMessage] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !authUtils.isAuthenticated()) {
      return;
    }

    const updateTimeRemaining = () => {
      const lastActivity = localStorage.getItem(LAST_ACTIVITY_KEY);
      if (lastActivity) {
        const lastActivityTime = parseInt(lastActivity, 10);
        const currentTime = Date.now();
        const timeElapsed = currentTime - lastActivityTime;
        const remaining = INACTIVITY_TIMEOUT - timeElapsed;
        
        if (remaining > 0) {
          setTimeRemaining(remaining);
          
         
          const warningTime = warningThreshold * 60 * 60 * 1000;
          setShowWarningMessage(showWarning && remaining <= warningTime);
        } else {
          setTimeRemaining(0);
          setShowWarningMessage(false);
        }
      }
    };

    updateTimeRemaining();

    const interval = setInterval(updateTimeRemaining, 60000);

    return () => clearInterval(interval);
  }, [showWarning, warningThreshold]);

  const formatTimeRemaining = (milliseconds: number): string => {
    const hours = Math.floor(milliseconds / (1000 * 60 * 60));
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  if (!authUtils.isAuthenticated() || timeRemaining === null) {
    return null;
  }

  if (!showWarningMessage) {
    return null;
  }

  return (
    <div className={`p-3 rounded-lg bg-amber-50 border border-amber-200 dark:bg-amber-900/20 dark:border-amber-800 ${className}`}>
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3">
          <p className="text-sm text-amber-800 dark:text-amber-200">
            <strong>Session Warning:</strong> You will be automatically logged out in {formatTimeRemaining(timeRemaining)} due to inactivity.
          </p>
        </div>
      </div>
    </div>
  );
};
