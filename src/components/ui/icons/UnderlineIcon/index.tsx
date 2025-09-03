import React from "react";

export interface IconProps {
  className?: string;
  width?: number | string;
  height?: number | string;
}

const UnderlineIcon: React.FC<IconProps> = ({
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
        d="M8 4C7.44772 4 7 4.44772 7 5C7 5.55228 7.44772 6 8 6H10.5858L6.29289 10.2929C5.90237 10.6834 5.90237 11.3166 6.29289 11.7071C6.68342 12.0976 7.31658 12.0976 7.70711 11.7071L12 7.41421V10C12 10.5523 12.4477 11 13 11C13.5523 11 14 10.5523 14 10V5C14 4.44772 13.5523 4 13 4H8ZM7 18C7 17.4477 7.44772 17 8 17H16C16.5523 17 17 17.4477 17 18C17 18.5523 16.5523 19 16 19H8C7.44772 19 7 18.5523 7 18Z"
        fill="currentColor"
      />
    </svg>
  );
};

export default UnderlineIcon;
