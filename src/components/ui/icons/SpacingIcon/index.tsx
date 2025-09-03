import React from "react";

export interface IconProps {
  className?: string;
  width?: number | string;
  height?: number | string;
}

const SpacingIcon: React.FC<IconProps> = ({
  className = "",
  width = 24,
  height = 24,
}) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M4 4C4 3.44772 4.44772 3 5 3H19C19.5523 3 20 3.44772 20 4V8C20 8.55228 19.5523 9 19 9H5C4.44772 9 4 8.55228 4 8V4ZM6 5V7H18V5H6ZM4 12C4 11.4477 4.44772 11 5 11H19C19.5523 11 20 11.4477 20 12V16C20 16.5523 19.5523 17 19 17H5C4.44772 17 4 16.5523 4 16V12ZM6 13V15H18V13H6ZM4 20C4 19.4477 4.44772 19 5 19H19C19.5523 19 20 19.4477 20 20C20 20.5523 19.5523 21 19 21H5C4.44772 21 4 20.5523 4 20Z"
        fill="currentColor"
      />
    </svg>
  );
};

export default SpacingIcon;
