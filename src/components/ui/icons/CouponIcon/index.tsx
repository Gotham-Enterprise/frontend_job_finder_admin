import React from 'react';

interface IconProps {
  className?: string;
  width?: number;
  height?: number;
}

const CouponIcon: React.FC<IconProps> = ({ 
  className = "", 
  width = 24, 
  height = 24 
}) => (
  <svg 
    className={className} 
    aria-hidden="true" 
    xmlns="http://www.w3.org/2000/svg" 
    width={width} 
    height={height} 
    fill="currentColor" 
    viewBox="0 0 24 24"
  >
    <path 
      fillRule="evenodd" 
      d="M4.5 6.75a2.25 2.25 0 0 1 2.25-2.25h10.5a2.25 2.25 0 0 1 2.25 2.25v10.5a2.25 2.25 0 0 1-2.25 2.25H6.75a2.25 2.25 0 0 1-2.25-2.25V6.75ZM15 7.5a.75.75 0 0 0-.75.75v7.5c0 .414.336.75.75.75h1.5a.75.75 0 0 0 .75-.75v-7.5a.75.75 0 0 0-.75-.75H15ZM3.75 12a.75.75 0 0 1 .75-.75h15a.75.75 0 0 1 0 1.5h-15a.75.75 0 0 1-.75-.75Zm3-3.75a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5Zm0 6.75a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5Z" 
      clipRule="evenodd"
    />
  </svg>
);

export default CouponIcon;
