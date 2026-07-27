"use client";
import React from "react";
import { usePathname } from "next/navigation";

export const DASHBOARD_REFRESH_EVENT = "dashboard:refresh";

const DashboardRefreshButton: React.FC = () => {
  const pathname = usePathname();

  // The refresh only remounts the dashboard widgets, so hide it elsewhere
  if (pathname !== "/admin") return null;

  return (
    <button
      onClick={() => window.dispatchEvent(new Event(DASHBOARD_REFRESH_EVENT))}
      title="Refresh Dashboard"
      aria-label="Refresh Dashboard"
      className="relative flex items-center justify-center text-gray-500 transition-colors bg-white border border-gray-200 rounded-full hover:text-dark-900 h-11 w-11 hover:bg-gray-100 hover:text-gray-700 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
    >
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
        />
      </svg>
    </button>
  );
};

export default DashboardRefreshButton;
