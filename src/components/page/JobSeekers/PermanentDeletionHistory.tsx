"use client";
import React from "react";
import { formatDate } from "@/services/utils/dateUtils";

interface DeletionHistoryEntry {
  id: string;
  action: string;
  details: string;
  createdAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

interface DeletionHistoryProps {
  entries: DeletionHistoryEntry[];
  isLoading: boolean;
}

export default function PermanentDeletionHistory({ entries, isLoading }: DeletionHistoryProps) {
  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!entries || entries.length === 0) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="text-center py-12">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No deletion history</h3>
          <p className="mt-1 text-sm text-gray-500">No permanent deletions have been performed yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
          Permanent Deletion History
        </h3>
        
        <div className="space-y-4">
          {entries.map((entry) => (
            <div
              key={entry.id}
              className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      PERMANENT DELETION
                    </span>
                    <span className="text-sm text-gray-500">
                      {formatDate(entry.createdAt)}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-900 mb-2">
                    {entry.details}
                  </p>
                  
                  <div className="flex items-center text-xs text-gray-500">
                    <span>Performed by:</span>
                    <span className="ml-1 font-medium">
                      {entry.user.firstName} {entry.user.lastName}
                    </span>
                    <span className="mx-1">•</span>
                    <span>{entry.user.email}</span>
                  </div>
                </div>
                
                <div className="flex-shrink-0 ml-4">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
