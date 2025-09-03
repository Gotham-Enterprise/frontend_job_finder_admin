import React from 'react';

interface IconProps {
  width?: number;
  height?: number;
  className?: string;
}

const BackgroundIcon: React.FC<IconProps> = ({ width = 24, height = 24, className = '' }) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect x="3" y="3" width="18" height="18" rx="3" fill="none" stroke="currentColor" />
  
      <path d="M8 8h8v8H8z" fill="currentColor" opacity="0.3" />
     
      <circle cx="18" cy="6" r="2" fill="currentColor" opacity="0.6" />
    </svg>
  );
};

export default BackgroundIcon;
