import React from "react";

export interface IconProps {
  className?: string;
  width?: number | string;
  height?: number | string;
}

const OrderedListIcon: React.FC<IconProps> = ({
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
        d="M8 5C8 4.44772 8.44772 4 9 4H11C11.5523 4 12 4.44772 12 5V7C12 7.55228 11.5523 8 11 8H9C8.44772 8 8 7.55228 8 7V5ZM14 7C14 6.44772 14.4477 6 15 6H20C20.5523 6 21 6.44772 21 7C21 7.55228 20.5523 8 20 8H15C14.4477 8 14 7.55228 14 7ZM8 11C8 10.4477 8.44772 10 9 10H11C11.5523 10 12 10.4477 12 11V13C12 13.5523 11.5523 14 11 14H9C8.44772 14 8 13.5523 8 13V11ZM14 13C14 12.4477 14.4477 12 15 12H20C20.5523 12 21 12.4477 21 13C21 13.5523 20.5523 14 20 14H15C14.4477 14 14 13.5523 14 13ZM8 17C8 16.4477 8.44772 16 9 16H11C11.5523 16 12 16.4477 12 17V19C12 19.5523 11.5523 20 11 20H9C8.44772 20 8 19.5523 8 19V17ZM14 19C14 18.4477 14.4477 18 15 18H20C20.5523 18 21 18.4477 21 19C21 19.5523 20.5523 20 20 20H15C14.4477 20 14 19.5523 14 19Z"
        fill="currentColor"
      />
    </svg>
  );
};

export default OrderedListIcon;
