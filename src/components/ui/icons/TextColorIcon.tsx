import React from 'react';

interface IconProps {
  width?: number;
  height?: number;
  className?: string;
}

const TextColorIcon: React.FC<IconProps> = ({ width = 24, height = 24, className = '' }) => {
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
      {/* Letter A for text */}
      <path d="M7 20l3-9 3 9M8.5 15h3" strokeWidth="2.5" />
      {/* Color underline */}
      <rect x="6" y="18" width="8" height="3" fill="currentColor" opacity="0.7" rx="1" />
      {/* Color palette indicator */}
      <circle cx="18" cy="6" r="2" fill="currentColor" opacity="0.8" />
      <circle cx="16" cy="9" r="1.5" fill="currentColor" opacity="0.6" />
    </svg>
  );
};

export default TextColorIcon;
