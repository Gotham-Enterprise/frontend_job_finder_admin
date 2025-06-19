import React from "react";

export interface IconProps {
  className?: string;
  width?: number | string;
  height?: number | string;
}

const PlusIcon: React.FC<IconProps> = ({
  className = "",
  width = 20,
  height = 20,
}) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
};

export default PlusIcon;
