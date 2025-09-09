import React from "react";

export interface IconProps {
  className?: string;
  width?: number | string;
  height?: number | string;
}

const BulletListIcon: React.FC<IconProps> = ({
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
        d="M8 6C8 4.89543 8.89543 4 10 4C11.1046 4 12 4.89543 12 6C12 7.10457 11.1046 8 10 8C8.89543 8 8 7.10457 8 6ZM14 7C14 6.44772 14.4477 6 15 6H20C20.5523 6 21 6.44772 21 7C21 7.55228 20.5523 8 20 8H15C14.4477 8 14 7.55228 14 7ZM8 12C8 10.8954 8.89543 10 10 10C11.1046 10 12 10.8954 12 12C12 13.1046 11.1046 14 10 14C8.89543 14 8 13.1046 8 12ZM14 13C14 12.4477 14.4477 12 15 12H20C20.5523 12 21 12.4477 21 13C21 13.5523 20.5523 14 20 14H15C14.4477 14 14 13.5523 14 13ZM8 18C8 16.8954 8.89543 16 10 16C11.1046 16 12 16.8954 12 18C12 19.1046 11.1046 20 10 20C8.89543 20 8 19.1046 8 18ZM14 19C14 18.4477 14.4477 18 15 18H20C20.5523 18 21 18.4477 21 19C21 19.5523 20.5523 20 20 20H15C14.4477 20 14 19.5523 14 19Z"
        fill="currentColor"
      />
    </svg>
  );
};

export default BulletListIcon;
