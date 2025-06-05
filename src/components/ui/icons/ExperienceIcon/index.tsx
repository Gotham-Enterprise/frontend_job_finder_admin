import React from 'react';

interface ExperienceIconProps {
  className?: string;
  size?: number;
}

export default function ExperienceIcon({ className = "w-4 h-4", size }: ExperienceIconProps) {
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
        d="M13 10V3L4 14h7v7l9-11h-7z" 
      />
    </svg>
  );
}
