"use client";

import { useState } from "react";
import { useGscSyncSitemaps } from "@/services/hooks/useGsc";
import type { GscProperty, GscSyncLogEntry } from "@/types/gsc";

interface PropertiesListProps {
  properties: GscProperty[] | null;
  syncHistory: GscSyncLogEntry[] | null;
  loading?: boolean;
}

export default function PropertiesList({ properties, syncHistory, loading }: PropertiesListProps) {
  const syncSitemaps = useGscSyncSitemaps();
  const [syncing, setSyncing] = useState(false);

  const handleSyncSitemaps = async () => {
    setSyncing(true);
    try {
      await syncSitemaps.mutateAsync();
    } catch {
      // ignore
    } finally {
      setSyncing(false);
    }
  };

  if (loading) {
    return <div className="h-48 animate-pulse rounded-xl bg-gray-100 dark:bg-gray-800" />;
  }

  if (!properties || properties.length === 0) return null;

  const latestSyncs: Record<string, GscSyncLogEntry> = {};
  if (syncHistory) {
    for (const log of syncHistory) {
      if (!latestSyncs[log.propertyId]) {
        latestSyncs[log.propertyId] = log;
      }
    }
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
      <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Properties</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50 dark:border-gray-700 dark:bg-gray-900">
              <th className="px-6 py-3 font-medium text-gray-500 dark:text-gray-400">Site URL</th>
              <th className="px-6 py-3 font-medium text-gray-500 dark:text-gray-400">Status</th>
              <th className="px-6 py-3 text-right font-medium text-gray-500 dark:text-gray-400">Data Rows</th>
              <th className="px-6 py-3 text-right font-medium text-gray-500 dark:text-gray-400">
                <span className="inline-flex items-center gap-1">
                  Sitemaps
                  <button
                    onClick={handleSyncSitemaps}
                    disabled={syncing}
                    className="inline-flex items-center rounded p-1 text-blue-600 hover:bg-blue-50 disabled:opacity-50 dark:text-blue-400 dark:hover:bg-blue-500/10"
                    title={syncing ? "Syncing..." : "Sync sitemaps from GSC"}
                  >
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
                    </svg>
                  </button>
                </span>
              </th>
              <th className="px-6 py-3 text-right font-medium text-gray-500 dark:text-gray-400">Last Sync</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {properties.map((prop) => {
              const sync = latestSyncs[prop.id];
              return (
                <tr key={prop.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{prop.siteUrl}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        prop.enabled
                          ? "bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-400"
                          : "bg-gray-100 text-gray-600 dark:bg-gray-500/15 dark:text-gray-400"
                      }`}
                    >
                      {prop.enabled ? "Active" : "Disabled"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-gray-600 dark:text-gray-400">{prop._count?.dailyData || 0}</td>
                  <td className="px-6 py-4 text-right text-gray-600 dark:text-gray-400">{prop._count?.sitemaps || 0}</td>
                  <td className="px-6 py-4 text-right text-gray-600 dark:text-gray-400">
                    {sync ? (
                      <span className={sync.status === "success" ? "text-green-600" : "text-red-600"}>
                        {new Date(sync.startedAt).toLocaleDateString()}
                      </span>
                    ) : prop.lastSyncedAt ? (
                      new Date(prop.lastSyncedAt).toLocaleDateString()
                    ) : (
                      "-"
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
