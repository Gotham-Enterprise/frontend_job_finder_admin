"use client";

import { useState } from "react";
import { useGscStatus, useGscUpdateSettings } from "@/services/hooks/useGsc";

export default function GscStatusBanner() {
  const { data, isLoading } = useGscStatus();
  const updateSettings = useGscUpdateSettings();
  const [toggling, setToggling] = useState(false);

  const enabled = data?.data?.enabled ?? false;
  const toggleValue = data?.data?.toggle?.value ?? "true";
  const lastSync = data?.data?.lastSyncs?.[0];

  const handleToggle = async () => {
    setToggling(true);
    try {
      const newValue = enabled ? "false" : "true";
      await updateSettings.mutateAsync({ key: "gsc_enabled", value: newValue });
    } catch (err) {
      console.error("Failed to toggle GSC:", err);
    } finally {
      setToggling(false);
    }
  };

  if (isLoading) {
    return <div className="mb-6 h-16 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700" />;
  }

  return (
    <div
      className={`mb-6 rounded-lg border p-4 ${
        enabled
          ? "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20"
          : "border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20"
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`h-3 w-3 rounded-full ${enabled ? "bg-green-500" : "bg-yellow-500"}`} />
          <span className={`text-sm font-medium ${enabled ? "text-green-800 dark:text-green-300" : "text-yellow-800 dark:text-yellow-300"}`}>
            GSC Integration: {enabled ? "Enabled" : "Disabled"}
          </span>
          {lastSync && enabled && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Last sync: {new Date(lastSync.startedAt).toLocaleDateString()} &mdash; {lastSync.rowsFetched} rows
            </span>
          )}
        </div>
        <button
          onClick={handleToggle}
          disabled={toggling}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            enabled
              ? "bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-500/15 dark:text-red-400"
              : "bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-500/15 dark:text-green-400"
          } disabled:opacity-50`}
        >
          {toggling ? "..." : enabled ? "Disable" : "Enable"}
        </button>
      </div>
    </div>
  );
}
