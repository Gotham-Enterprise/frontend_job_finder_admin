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
  variant?: 'default' | 'inline' | 'jobDetails';
  title?: string;
}

const ErrorState: React.FC<ErrorStateProps> = ({
  className = "",
  message,
  onRetry,
  retryText = "Retry",
  height = "h-64",
  showRetryButton = true,
  retryIcon,
  variant = "default",
  title = "Error"
}) => {
  const renderDefaultError = () => (
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

  const renderInlineError = () => (
    <div className={`bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 ${className}`}>
      <div className="flex">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
            {title}
          </h3>
          <div className="mt-2 text-sm text-red-700 dark:text-red-300">
            {message}
          </div>
          {showRetryButton && onRetry && (
            <div className="mt-3">
              <Button 
                onClick={onRetry} 
                className="text-xs"
                startIcon={retryIcon}
              >
                {retryText}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderJobDetailsError = () => (
    <div className={`p-6 ${className}`}>
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
              {title}
            </h3>
            <div className="mt-2 text-sm text-red-700 dark:text-red-300">
              {message}
            </div>
            {showRetryButton && onRetry && (
              <div className="mt-3">
                <Button 
                  onClick={onRetry} 
                  className="text-xs"
                  startIcon={retryIcon}
                >
                  {retryText}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  switch (variant) {
    case 'inline':
      return renderInlineError();
    case 'jobDetails':
      return renderJobDetailsError();
    default:
      return renderDefaultError();
  }
};

export default ErrorState;
