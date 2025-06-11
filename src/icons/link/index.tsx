import React from 'react';

interface IconProps {
  className?: string;
  width?: number;
  height?: number;
}

const LinkIcon: React.FC<IconProps> = ({ 
  className = "w-5 h-5", 
  width = 24, 
  height = 24 
}) => (
  <svg 
    className={className} 
    aria-hidden="true" 
    xmlns="http://www.w3.org/2000/svg" 
    width={width} 
    height={height} 
    fill="none" 
    viewBox="0 0 24 24"
  >
    <path 
      stroke="currentColor" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      strokeWidth="2" 
      d="M13.213 9.787a3.391 3.391 0 0 0-4.795 0l-3.425 3.426a3.39 3.39 0 0 0 4.795 4.794l.321-.304m-.321-4.49a3.39 3.39 0 0 0 4.795 0l3.424-3.426a3.39 3.39 0 0 0-4.794-4.795l-1.028.961"
    />
  </svg>
);

export default LinkIcon;
