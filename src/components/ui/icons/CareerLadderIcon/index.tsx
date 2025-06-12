import React from 'react';

interface IconProps {
  width?: number;
  height?: number;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  className?: string;
}

const CareerLadderIcon: React.FC<IconProps> = ({
  width = 24,
  height = 24,
  fill = "none",
  stroke = "currentColor",
  strokeWidth = 2,
  className = "",
}) => {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={width} 
      height={height} 
      viewBox="0 0 24 24" 
      fill={fill} 
      stroke={stroke} 
      strokeWidth={strokeWidth} 
      strokeLinecap="round" 
      strokeLinejoin="round"
      className={className}
    >
      <path d="M6 2v20"></path>
      <path d="M18 2v20"></path>
      <path d="M6 6h12"></path>
      <path d="M6 10h12"></path>
      <path d="M6 14h12"></path>
      <path d="M6 18h12"></path>
      <circle cx="9" cy="8" r="1"></circle>
      <circle cx="15" cy="12" r="1"></circle>
      <circle cx="9" cy="16" r="1"></circle>
    </svg>
  );
};

export default CareerLadderIcon;
