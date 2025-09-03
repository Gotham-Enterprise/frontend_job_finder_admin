import React from 'react';

interface IconProps {
  width?: number;
  height?: number;
  className?: string;
}

const BorderIcon: React.FC<IconProps> = ({ width = 24, height = 24, className = '' }) => {
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

      <rect x="4" y="4" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" />

      <rect x="7" y="7" width="10" height="10" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.3" strokeDasharray="2,2" />
      <circle cx="4" cy="4" r="1" fill="currentColor" />
      <circle cx="20" cy="4" r="1" fill="currentColor" />
      <circle cx="4" cy="20" r="1" fill="currentColor" />
      <circle cx="20" cy="20" r="1" fill="currentColor" />
    </svg>
  );
};

export default BorderIcon;
