"use client";

import React from "react";

interface NewsletterToggleCardProps {
  isEnabled: boolean;
  isUpdating: boolean;
  onChange: (isEnabled: boolean) => void;
}

const NewsletterToggleCard: React.FC<NewsletterToggleCardProps> = ({
  isEnabled,
  isUpdating,
  onChange,
}) => {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="flex items-center justify-between gap-4 p-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Weekly Job Seeker Newsletter
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {isEnabled
              ? "Enabled — the weekly send runs every Monday at 10:00 AM ET via scheduled cron. Subscribers keep receiving until you disable this or they unsubscribe."
              : "Disabled — the weekly send will not run. Toggle on to start the weekly schedule."}
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={isEnabled}
          disabled={isUpdating}
          onClick={() => onChange(!isEnabled)}
          className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 ${
            isEnabled ? "bg-green-500" : "bg-gray-300 dark:bg-gray-700"
          }`}
        >
          <span
            className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
              isEnabled ? "translate-x-5" : "translate-x-1"
            }`}
          />
        </button>
      </div>
    </div>
  );
};

export default NewsletterToggleCard;
