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
    <div className="fixed inset-0 bg-white dark:bg-black bg-opacity-50 flex items-center justify-center z-[9999]">      
    <div className="flex flex-col items-center space-y-4">
      
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
        
        <p className="text-dark dark:text-white text-center font-medium">{message}</p>
      </div>
    </div>
  );
};

export default FullScreenSpinner;
