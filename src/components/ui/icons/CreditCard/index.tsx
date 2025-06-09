import React from 'react';

interface CreditCardIconProps {
  className?: string;
  size?: number;
}

export default function CreditCardIcon({ className = "w-5 h-5", size }: CreditCardIconProps) {
  const sizeStyle = size ? { width: size, height: size } : {};
  
  return (
    <svg 
      className={className} 
      style={sizeStyle}
      fill="none" 
      stroke="currentColor" 
      viewBox="0 0 24 24"
    >
      <rect 
        x="2" 
        y="5" 
        width="20" 
        height="14" 
        rx="2" 
        strokeWidth={2}
      />
      <line 
        x1="2" 
        y1="10" 
        x2="22" 
        y2="10" 
        strokeWidth={2}
      />
    </svg>
  );
}
