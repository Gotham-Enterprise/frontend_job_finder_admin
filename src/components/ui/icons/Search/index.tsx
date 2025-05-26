import React from "react";

export interface IconProps {
  className?: string;
  width?: number | string;
  height?: number | string;
}

const SearchIcon: React.FC<IconProps> = ({
  className = "",
  width = 24,
  height = 24,
}) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`text-gray-600 dark:text-gray-100 ${className}`}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M10.5 3.5C6.634 3.5 3.5 6.634 3.5 10.5C3.5 14.366 6.634 17.5 10.5 17.5C12.137 17.5 13.65 16.914 14.809 15.928L19.191 20.309C19.582 20.7 20.215 20.7 20.606 20.309C20.997 19.918 20.997 19.285 20.606 18.894L16.225 14.513C17.211 13.354 17.5 11.841 17.5 10.5C17.5 6.634 14.366 3.5 10.5 3.5ZM5.5 10.5C5.5 7.739 7.739 5.5 10.5 5.5C13.261 5.5 15.5 7.739 15.5 10.5C15.5 13.261 13.261 15.5 10.5 15.5C7.739 15.5 5.5 13.261 5.5 10.5Z"
        fill="currentColor"
      />
    </svg>
  );
};

export default SearchIcon;