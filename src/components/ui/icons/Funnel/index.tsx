import React from "react";

export interface IconProps {
  className?: string;
  width?: number | string;
  height?: number | string;
}

const FunnelIcon: React.FC<IconProps> = ({
  className = "",
  width = 16,
  height = 16,
}) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M2 3C2 2.44772 2.44772 2 3 2H13C13.5523 2 14 2.44772 14 3C14 3.55228 13.5523 4 13 4H3C2.44772 4 2 3.55228 2 3ZM4 7C4 6.44772 4.44772 6 5 6H11C11.5523 6 12 6.44772 12 7C12 7.55228 11.5523 8 11 8H5C4.44772 8 4 7.55228 4 7ZM6 11C6 10.4477 6.44772 10 7 10H9C9.55228 10 10 10.4477 10 11C10 11.5523 9.55228 12 9 12H7C6.44772 12 6 11.5523 6 11Z"
        fill="currentColor"
      />
    </svg>
  );
};

export default FunnelIcon;