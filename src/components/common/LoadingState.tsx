import React from 'react';

interface LoadingStateProps {
  className?: string;
  message?: string;
  height?: string;
  spinnerSize?: 'small' | 'medium' | 'large';
}

const LoadingState: React.FC<LoadingStateProps> = ({
  className = "",
  message = "Loading...",
  height = "h-64",
  spinnerSize = "medium"
}) => {
  const spinnerSizeClasses = {
    small: "h-4 w-4",
    medium: "h-6 w-6",
    large: "h-8 w-8"
  };

  return (
    <div className={`rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] ${className}`}>
      <div className={`flex items-center justify-center ${height}`}>
        <div className="flex items-center gap-3">
          <div className={`animate-spin rounded-full ${spinnerSizeClasses[spinnerSize]} border-b-2 border-brand-500`}></div>
          <p className="text-gray-500 dark:text-gray-400">{message}</p>
        </div>
      </div>
    </div>
  );
};

export default LoadingState;
