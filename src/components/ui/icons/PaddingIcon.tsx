import React from 'react';

interface IconProps {
  width?: number;
  height?: number;
  className?: string;
}

const PaddingIcon: React.FC<IconProps> = ({ width = 24, height = 24, className = '' }) => {
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
      {/* Outer container */}
      <rect x="3" y="3" width="18" height="18" fill="none" stroke="currentColor" />
      {/* Inner content area with padding indicators */}
      <rect x="7" y="7" width="10" height="10" fill="none" stroke="currentColor" strokeDasharray="2,2" opacity="0.7" />
      {/* Padding indicators */}
      <path d="M5 5h2v2M17 5h2v2M5 17h2v2M17 17h2v2" strokeWidth="1" fill="currentColor" opacity="0.4" />
    </svg>
  );
};

export default PaddingIcon;
