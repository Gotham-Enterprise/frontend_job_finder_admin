import React from 'react';

interface FullScreenSpinnerProps {
  isVisible: boolean;
  message?: string;
}

const FullScreenSpinner: React.FC<FullScreenSpinnerProps> = ({ 
  isVisible, 
  message = 'Loading...' 
}) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4 rounded-2xl bg-white dark:bg-gray-800 px-8 py-6 shadow-2xl">
        {/* Spinner */}
        <div className="relative h-16 w-16">
          <div className="absolute h-full w-full rounded-full border-4 border-gray-200 dark:border-gray-700"></div>
          <div className="absolute h-full w-full animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
        
        {/* Message */}
        <div className="flex flex-col items-center gap-1">
          <p className="text-lg font-semibold text-gray-900 dark:text-white">
            {message}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Please wait...
          </p>
        </div>
      </div>
    </div>
  );
};

export default FullScreenSpinner;
