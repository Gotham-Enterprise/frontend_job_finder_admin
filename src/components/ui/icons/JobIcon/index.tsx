import React from 'react';

interface JobIconProps {
  className?: string;
  size?: number;
}

export default function JobIcon({ className = "w-4 h-4", size }: JobIconProps) {
  const sizeStyle = size ? { width: size, height: size } : {};
  
  return (
    <svg 
      className={className} 
      style={sizeStyle}
      fill="none" 
      stroke="currentColor" 
      viewBox="0 0 24 24"
    >
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth={2} 
        d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" 
      />
    </svg>
  );
}
