"use client";

import React from "react";
import { Clock, RefreshCw, CheckCircle, XCircle, Zap, User } from "lucide-react";
import type { ScraperRun } from "@/services/api/medicalLibraryScraper";

const getStatusBadge = (status: ScraperRun["status"]) => {
  const styles = {
    pending: { bg: "bg-gray-100 dark:bg-gray-800", text: "text-gray-700 dark:text-gray-300", icon: Clock },
    running: { bg: "bg-blue-100 dark:bg-blue-900/30", text: "text-blue-700 dark:text-blue-400", icon: RefreshCw },
    completed: { bg: "bg-green-100 dark:bg-green-900/30", text: "text-green-700 dark:text-green-400", icon: CheckCircle },
    failed: { bg: "bg-red-100 dark:bg-red-900/30", text: "text-red-700 dark:text-red-400", icon: XCircle },
  };
  const style = styles[status] || styles.pending;
  const Icon = style.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${style.bg} ${style.text}`}>
      <Icon className={`w-3 h-3 ${status === "running" ? "animate-spin" : ""}`} />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

const TriggerBadge: React.FC<{ run: ScraperRun }> = ({ run }) => {
  if (run.triggerSource === "scheduled") {
    return (
      <span className="flex items-center gap-1 px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded text-xs">
        <Zap className="w-3 h-3" />
        Scheduled
      </span>
    );
  }
  const name = run.triggeredByUser ? `${run.triggeredByUser.firstName} ${run.triggeredByUser.lastName}` : "Manual";
  return (
    <span className="flex items-center gap-1 px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded text-xs">
      <User className="w-3 h-3" />
      {name}
    </span>
  );
};

const ProgressBar: React.FC<{ run: ScraperRun }> = ({ run }) => {
  if (run.status !== "running" && run.status !== "pending") return null;
  const total = run.totalTopics || 0;
  const pct = total > 0 ? Math.min(100, Math.round((run.processedTopics / total) * 100)) : 0;
  return (
    <div className="w-32">
      <div className="h-1.5 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div className="h-full bg-blue-500 transition-all" style={{ width: `${total > 0 ? pct : 5}%` }} />
      </div>
      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
        {total > 0 ? `${run.processedTopics} / ${total}` : "Waiting to start…"}
      </div>
    </div>
  );
};

const RunsTable: React.FC<{ runs: ScraperRun[] }> = ({ runs }) => {
  return (
    <div className="border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50 dark:bg-gray-900/50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Triggered By
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Progress
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Results
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Started
            </th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-transparent divide-y divide-gray-200 dark:divide-gray-800">
          {runs.map((run) => (
            <tr key={run.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors">
              <td className="px-6 py-4">
                <TriggerBadge run={run} />
              </td>
              <td className="px-6 py-4">{getStatusBadge(run.status)}</td>
              <td className="px-6 py-4">
                <ProgressBar run={run} />
                {(run.status === "completed" || run.status === "failed") && (
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {run.processedTopics} processed
                  </span>
                )}
              </td>
              <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                <span className="text-green-600 dark:text-green-400">{run.createdCount} new</span>
                {" · "}
                <span className="text-blue-600 dark:text-blue-400">{run.updatedCount} updated</span>
                {run.failedCount > 0 && (
                  <>
                    {" · "}
                    <span className="text-red-600 dark:text-red-400">{run.failedCount} failed</span>
                  </>
                )}
              </td>
              <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                {run.startedAt ? new Date(run.startedAt).toLocaleString() : "—"}
              </td>
            </tr>
          ))}
          {runs.length === 0 && (
            <tr>
              <td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                No scraper runs yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default RunsTable;
