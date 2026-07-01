"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useDuplicateJobs } from "@/services/hooks/useSeoReports";
import { seoReportsAPI } from "@/services/api/seoReportsAPI";

export default function DuplicatesTabContent() {
  const queryClient = useQueryClient();
  const { data: duplicatesData, isPending: duplicatesPending, error: duplicatesError } = useDuplicateJobs();

  const [refreshingDuplicateJobs, setRefreshingDuplicateJobs] = useState(false);
  const refreshPollRef = useRef<NodeJS.Timeout | null>(null);
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const stopRefreshPolling = useCallback(() => {
    if (refreshPollRef.current) {
      clearInterval(refreshPollRef.current);
      refreshPollRef.current = null;
    }
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
      refreshTimeoutRef.current = null;
    }
    setRefreshingDuplicateJobs(false);
  }, []);

  const startRefreshPolling = useCallback(() => {
    setRefreshingDuplicateJobs(true);
    refreshPollRef.current = setInterval(() => {
      queryClient.invalidateQueries({ queryKey: ["seoDuplicateJobs"] });
    }, 5000);
    refreshTimeoutRef.current = setTimeout(() => {
      stopRefreshPolling();
    }, 120000);
  }, [queryClient, stopRefreshPolling]);

  useEffect(() => {
    if (refreshingDuplicateJobs && duplicatesData?.data && duplicatesData.data.length > 0) {
      stopRefreshPolling();
    }
  }, [refreshingDuplicateJobs, duplicatesData, stopRefreshPolling]);

  useEffect(() => {
    return () => {
      if (refreshPollRef.current) clearInterval(refreshPollRef.current);
      if (refreshTimeoutRef.current) clearTimeout(refreshTimeoutRef.current);
    };
  }, []);

  const handleRefresh = useCallback(() => {
    seoReportsAPI.refreshDuplicateJobs();
    startRefreshPolling();
  }, [startRefreshPolling]);

  if (duplicatesPending) {
    return (
      <div className="flex items-center justify-center py-12 text-gray-500 dark:text-gray-400">
        <svg className="mr-2 h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        Loading duplicate jobs...
      </div>
    );
  }

  if (duplicatesError) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
        Failed to load duplicate jobs data.
      </div>
    );
  }

  if (!duplicatesData?.data || duplicatesData.data.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-6 text-center text-gray-600 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400">
        {refreshingDuplicateJobs ? (
          <div className="flex items-center justify-center gap-2">
            <svg className="h-5 w-5 animate-spin text-gray-500" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Refreshing duplicate jobs report...
          </div>
        ) : (
          <>
            <p>No duplicate jobs found! Your job index is perfectly clean.</p>
            <div className="mt-4">
              <button
                onClick={handleRefresh}
                className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Refresh Now
              </button>
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden dark:border-gray-800 dark:bg-gray-900">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Exact Duplicates Overview</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Showing job postings that share the exact same Title, Company, and Location.
            </p>
          </div>
          <button
            onClick={handleRefresh}
            className="mt-4 sm:mt-0 inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Refresh
          </button>
          {refreshingDuplicateJobs && (
            <span className="ml-3 inline-flex items-center text-sm text-gray-500 dark:text-gray-400">
              <svg className="mr-2 h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Refreshing...
            </span>
          )}
        </div>
        <div className="max-h-[600px] overflow-y-auto overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
            <thead className="sticky top-0 bg-gray-50 dark:bg-gray-800/50 z-10 shadow-sm">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Title & Company</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Location</th>
                <th scope="col" className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Count</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Manage Jobs</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-800 dark:bg-gray-900">
              {duplicatesData.data.map((group, idx) => (
                <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="px-6 py-4 align-top">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">{group.title}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{group.companyName}</div>
                  </td>
                  <td className="px-6 py-4 align-top">
                    <div className="text-sm text-gray-900 dark:text-white">{group.locationCity}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{group.locationState}</div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-center align-top">
                    <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800 dark:bg-red-900 dark:text-red-300">
                      {group.duplicateCount} duplicates
                    </span>
                  </td>
                  <td className="px-6 py-4 align-top">
                    <div className="flex flex-wrap gap-2">
                      {group.jobIds.map((id, index) => {
                        const FRONTEND_URL = process.env.NEXT_PUBLIC_FRONTEND_URL || "https://gothamenterprisesltd.com";
                        const titleSlug = (group.title || "").toLowerCase().replace(/[^\w\s]/gi, "").replace(/\s+/g, "-");
                        const publicUrl = `${FRONTEND_URL}/find-jobs/all-jobs/${id}/${titleSlug}`;
                        return (
                          <a
                            key={id}
                            href={publicUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 rounded-md border border-gray-300 bg-white px-2.5 py-1 text-xs font-medium text-blue-600 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-800 dark:text-blue-400 dark:hover:bg-gray-700"
                          >
                            View #{index + 1}
                            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                            </svg>
                          </a>
                        );
                      })}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
