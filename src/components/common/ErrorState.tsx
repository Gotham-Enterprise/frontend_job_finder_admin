import React from 'react';
import Button from '../ui/button/Button';

interface ErrorStateProps {
  className?: string;
  message: string;
  onRetry?: () => void;
  retryText?: string;
  height?: string;
  showRetryButton?: boolean;
  retryIcon?: React.ReactNode;
}

const ErrorState: React.FC<ErrorStateProps> = ({
  className = "",
  message,
  onRetry,
  retryText = "Retry",
  height = "h-64",
  showRetryButton = true,
  retryIcon
}) => {
  return (
    <div className={`rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] ${className}`}>
      <div className={`flex flex-col items-center justify-center ${height} px-6`}>
        <div className="text-center">
          <p className="text-red-500">{message}</p>
          {showRetryButton && onRetry && (
            <Button 
              onClick={onRetry} 
              className="mt-4"
              startIcon={retryIcon}
            >
              {retryText}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ErrorState;
