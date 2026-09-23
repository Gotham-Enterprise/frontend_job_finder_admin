"use client";

import React from "react";
import { MedicalLibraryPreviousVersion, MedicalLibraryTopic } from "@/services/api/medicalLibrary";

interface PendingChangesPanelProps {
  previousVersion: MedicalLibraryPreviousVersion;
  current: MedicalLibraryTopic;
}

function FieldDiffRow({ label, oldValue, newValue }: { label: string; oldValue: string; newValue: string }) {
  if (oldValue === newValue) return null;
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-500 mb-1">
          {label} — previous
        </p>
        <p className="text-sm text-gray-700 dark:text-gray-300 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-lg px-3 py-2 whitespace-pre-wrap">
          {oldValue || <span className="italic text-gray-400">(empty)</span>}
        </p>
      </div>
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-500 mb-1">
          {label} — new (from latest scrape)
        </p>
        <p className="text-sm text-gray-700 dark:text-gray-300 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-lg px-3 py-2 whitespace-pre-wrap">
          {newValue || <span className="italic text-gray-400">(empty)</span>}
        </p>
      </div>
    </div>
  );
}

// Tabs are matched by position — the scraper always emits the same fixed tab
// order for a given NAMI page, and the form caps a topic at 3 tabs, so index
// matching is simple and reliable without needing tabName-based fuzzy matching.
function ContentDiff({ previousVersion, current }: PendingChangesPanelProps) {
  const oldTabs = previousVersion.content?.tabs || [];
  const newTabs = current.content?.tabs || [];
  const tabCount = Math.max(oldTabs.length, newTabs.length);

  const rows = Array.from({ length: tabCount }, (_, i) => {
    const oldTab = oldTabs[i];
    const newTab = newTabs[i];
    const oldHtml = (oldTab?.sections || []).map((s) => s.html).join("\n");
    const newHtml = (newTab?.sections || []).map((s) => s.html).join("\n");
    const label = newTab?.tabName || oldTab?.tabName || `Tab ${i + 1}`;
    return { label, oldHtml, newHtml };
  }).filter((row) => row.oldHtml !== row.newHtml);

  if (rows.length === 0) return null;

  return (
    <div className="space-y-4">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
        Content
      </p>
      {rows.map((row) => (
        <FieldDiffRow key={row.label} label={row.label} oldValue={row.oldHtml} newValue={row.newHtml} />
      ))}
    </div>
  );
}

/** Shown on the edit form when a re-import found real changes on the source page and re-queued this topic for review — makes exactly what changed visible instead of leaving the admin to compare by memory. */
export default function PendingChangesPanel({ previousVersion, current }: PendingChangesPanelProps) {
  return (
    <div className="rounded-2xl border border-amber-300 dark:border-amber-500/30 bg-amber-50/60 dark:bg-amber-500/5 p-5 space-y-4">
      <div>
        <p className="text-sm font-semibold text-amber-800 dark:text-amber-400">
          This topic was re-imported with changes
        </p>
        <p className="text-xs text-amber-700/80 dark:text-amber-500/70 mt-0.5">
          A re-scrape of the source page found differences below and reset this topic to Draft for
          review. Saving (even without further edits) accepts the new content and clears this notice.
        </p>
      </div>

      <FieldDiffRow label="Title" oldValue={previousVersion.title} newValue={current.title} />
      <FieldDiffRow label="Category" oldValue={previousVersion.category} newValue={current.category} />
      <FieldDiffRow
        label="Description"
        oldValue={previousVersion.description || ""}
        newValue={current.description || ""}
      />
      <ContentDiff previousVersion={previousVersion} current={current} />
    </div>
  );
}
