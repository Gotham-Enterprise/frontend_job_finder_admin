import React from 'react';

export interface IconProps {
  className?: string;
  size?: number;
}

const BackArrowIcon: React.FC<IconProps> = ({ 
  className = "w-4 h-4", 
  size 
}) => {
  const sizeClasses = size ? `w-${size} h-${size}` : className;
  
  return (
    <svg 
      className={sizeClasses} 
      fill="none" 
      stroke="currentColor" 
      viewBox="0 0 24 24"
    >
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth={2} 
        d="M15 19l-7-7 7-7" 
      />
    </svg>
  );
};

export default BackArrowIcon;
