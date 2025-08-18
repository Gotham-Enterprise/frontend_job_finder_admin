import React from "react";

interface Props {
  width?: number;
  height?: number;
}

const AccountCheckCircle: React.FC<Props> = ({ width = 128, height = 128 }) => {
  return (
    <svg width={width} height={height} viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M117.333 59.0933V64C117.326 75.5009 113.602 86.6916 106.716 95.903C99.8296 105.114 90.1502 111.853 79.1213 115.114C68.0923 118.375 56.3047 117.983 45.5165 113.998C34.7283 110.012 25.5175 102.646 19.2578 92.9977C12.9981 83.3495 10.0249 71.9363 10.7816 60.4603C11.5383 48.9843 15.9845 38.0604 23.4568 29.3177C30.9292 20.575 41.0275 14.482 52.2457 11.9474C63.4638 9.41282 75.2008 10.5724 85.706 15.2533M117.333 21.3333L63.9994 74.72L47.9994 58.72"
        stroke="#34C759"
        stroke-width="8"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  );
};

export default AccountCheckCircle;
