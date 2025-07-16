import React from 'react';

interface IconProps {
  width?: number;
  height?: number;
  className?: string;
}

const MarginIcon: React.FC<IconProps> = ({ width = 24, height = 24, className = '' }) => {
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
      {/* Outer border representing margin */}
      <rect x="2" y="2" width="20" height="20" fill="none" stroke="currentColor" strokeDasharray="3,2" opacity="0.5" />
      {/* Inner box representing content */}
      <rect x="6" y="6" width="12" height="12" fill="none" stroke="currentColor" />
      {/* Margin indicators */}
      <path d="M4 1v2M4 21v2M1 4h2M21 4h2" strokeWidth="1.5" />
    </svg>
  );
};

export default MarginIcon;
