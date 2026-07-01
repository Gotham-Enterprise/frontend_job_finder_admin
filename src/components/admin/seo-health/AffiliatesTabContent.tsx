"use client";

import { useState } from "react";
import { useAffiliateJobs } from "@/services/hooks/useSeoReports";

export default function AffiliatesTabContent() {
  const [affiliatePage, setAffiliatePage] = useState(1);
  const { data: affiliateData, isPending: affiliatePending, error: affiliateError } = useAffiliateJobs(affiliatePage, 50);

  if (affiliatePending) {
    return (
      <div className="flex items-center justify-center py-12 text-gray-500 dark:text-gray-400">
        <svg className="mr-2 h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        Loading affiliate jobs...
      </div>
    );
  }

  if (affiliateError) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
        Failed to load affiliate jobs.
      </div>
    );
  }

  if (!affiliateData?.data || affiliateData.data.jobs.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-6 text-center text-gray-600 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400">
        No affiliate jobs found.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden dark:border-gray-800 dark:bg-gray-900">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Affiliate Jobs</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Showing {(affiliatePage - 1) * 50 + 1} - {Math.min(affiliatePage * 50, affiliateData.data.pagination.total)} of {affiliateData.data.pagination.total.toLocaleString()} total affiliate jobs.
            </p>
          </div>
          <div className="mt-4 flex sm:mt-0 space-x-2">
            <button
              onClick={() => setAffiliatePage((p) => Math.max(1, p - 1))}
              disabled={affiliatePage === 1}
              className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Previous
            </button>
            <button
              onClick={() => setAffiliatePage((p) => Math.min(affiliateData.data.pagination.totalPages, p + 1))}
              disabled={affiliatePage === affiliateData.data.pagination.totalPages}
              className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Next
            </button>
          </div>
        </div>
        <div className="max-h-[600px] overflow-y-auto overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
            <thead className="sticky top-0 bg-gray-50 dark:bg-gray-800/50 z-10 shadow-sm">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Job Details</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Location</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Source</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-800 dark:bg-gray-900">
              {affiliateData.data.jobs.map((job) => {
                const isExpired = job.expiresAt ? new Date(job.expiresAt) < new Date() : false;
                const status = !job.isPublished ? "Draft" : job.isArchived ? "Archived" : isExpired ? "Expired" : "Active";
                return (
                  <tr key={job.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="px-6 py-4 align-top">
                      <div className="text-sm font-medium text-gray-900 dark:text-white max-w-xs truncate">{job.title}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{job.companyName}</div>
                      <div className="text-xs text-gray-400 mt-1">ID: {job.id}</div>
                    </td>
                    <td className="px-6 py-4 align-top">
                      <div className="text-sm text-gray-900 dark:text-white">{job.locationCity || "Remote"}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{job.locationState}</div>
                    </td>
                    <td className="px-6 py-4 align-top text-sm text-gray-500 dark:text-gray-400">
                      {job.affiliate?.name || job.affiliateId}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 align-top">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        status === "Active"
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                          : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
                      }`}>
                        {status}
                      </span>
                      <div className="text-xs text-gray-400 mt-1">
                        Posted: {new Date(job.datePosted).toLocaleDateString()}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
