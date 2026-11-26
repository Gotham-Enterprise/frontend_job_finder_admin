"use client";

import React, { useState } from "react";
import { Loader2, ShieldAlert } from "lucide-react";
import Pagination from "@/components/tables/Pagination";
import type { ContentFlag, FlagStatus } from "@/services/api/campaignModeration";
import { useContentFlags, useReviewContentFlag } from "@/services/hooks/useContentFlags";
import { formatDateTime } from "../CampaignEnquiries/labels";

const PAGE_SIZE = 10;
const TABS: { key: FlagStatus; label: string }[] = [
  { key: "FLAGGED", label: "Needs Review" },
  { key: "APPROVED", label: "Approved" },
  { key: "UPHELD", label: "Upheld" },
];
const STAGES = { BRIEF: "Customer's brief", PREPARE: "Prepared by Gotham", LAUNCH: "About to be sent" } as const;

function FlagCard({ flag }: { flag: ContentFlag }) {
  const [note, setNote] = useState("");
  const review = useReviewContentFlag();
  const busy = review.isPending;
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="m-0 text-sm font-semibold text-gray-900 dark:text-white">
            {flag.companyName}
            {flag.campaignName ? <span className="font-normal text-gray-500"> · {flag.campaignName}</span> : null}
          </p>
          <p className="m-0 mt-0.5 text-xs text-gray-500">
            {STAGES[flag.stage]} · flagged {formatDateTime(flag.createdAt)}{flag.reviewRequestedAt ? ` · review asked ${formatDateTime(flag.reviewRequestedAt)}` : ""} · AI confidence {Math.round(flag.confidence * 100)}%
            {flag.stage !== "PREPARE" ? (flag.customerNotified ? " · customer emailed" : " · customer not emailed yet") : ""}
          </p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {flag.reasons.map((reason) => (
            <span key={reason} className="rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-medium text-red-700 dark:bg-red-900/30 dark:text-red-300">
              {reason}
            </span>
          ))}
        </div>
      </div>
      <p className="m-0 mt-3 text-sm text-gray-700 dark:text-gray-300">{flag.explanation}</p>
      <pre className="mt-3 max-h-48 overflow-auto whitespace-pre-wrap rounded-lg bg-gray-50 p-3 font-sans text-[13px] text-gray-800 dark:bg-gray-800 dark:text-gray-200">{flag.excerpt}</pre>
      {flag.reviewRequestNote && (
        <p className="mt-3 mb-0 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:border-amber-900/50 dark:bg-amber-900/20 dark:text-amber-100">
          <b>Customer&apos;s note:</b> {flag.reviewRequestNote}
        </p>
      )}

      {flag.status === "FLAGGED" ? (
        <div className="mt-4 space-y-3">
          <input
            value={note}
            maxLength={1000}
            onChange={(event) => setNote(event.target.value)}
            placeholder="Note (optional). Approving emails this note to the customer."
            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          />
          <div className="flex flex-wrap gap-2">
            <button
              disabled={busy}
              onClick={() => review.mutate({ id: flag.id, decision: "APPROVE", note })}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-3.5 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
            >
              {busy && <Loader2 className="h-4 w-4 animate-spin" />} Approve: this message is fine
            </button>
            <button
              disabled={busy}
              onClick={() => review.mutate({ id: flag.id, decision: "UPHOLD", note })}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3.5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
            >
              Uphold: keep it blocked
            </button>
          </div>
        </div>
      ) : (
        <p className="m-0 mt-3 text-xs text-gray-500">
          {flag.status === "APPROVED" ? "Approved" : "Upheld"} by {flag.reviewedBy ?? "staff"}
          {flag.reviewedAt ? ` on ${formatDateTime(flag.reviewedAt)}` : ""}
          {flag.reviewNote ? `: ${flag.reviewNote}` : ""}
        </p>
      )}
    </div>
  );
}

export default function CampaignContentFlags() {
  const [status, setStatus] = useState<FlagStatus>("FLAGGED");
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, refetch } = useContentFlags({ status, page, limit: PAGE_SIZE });

  return (
    <div className="mx-auto max-w-5xl space-y-5 p-4 sm:p-6">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600 dark:bg-red-900/30">
          <ShieldAlert className="h-5 w-5" />
        </span>
        <div>
          <h1 className="m-0 text-xl font-semibold text-gray-900 dark:text-white">Flagged Campaign Content</h1>
          <p className="m-0 mt-0.5 text-sm text-gray-500">
            An AI reads every campaign message before it can be sent. A flagged message is blocked and the customer is told on screen and by email; most just edit it and send it again. Only messages where the customer clicked "Ask Gotham to review" appear here. If the AI got it wrong, approve it; the customer is emailed and can send it. Otherwise uphold it and they are told it stays blocked.
          </p>
        </div>
      </div>

      <div className="flex gap-2">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => {
              setStatus(tab.key);
              setPage(1);
            }}
            className={`rounded-full border px-3.5 py-1.5 text-sm font-medium ${status === tab.key ? "border-primary bg-primary text-white" : "border-gray-200 bg-white text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"}`}
          >
            {tab.label}
            {data ? ` (${data.counts[tab.key]})` : ""}
          </button>
        ))}
      </div>

      {isLoading ? (
        <p className="text-sm text-gray-500">Loading…</p>
      ) : isError ? (
        <p className="text-sm text-red-600">
          Could not load flagged content.{" "}
          <button className="underline" onClick={() => refetch()}>
            Try again
          </button>
        </p>
      ) : data && data.flags.length === 0 ? (
        <p className="rounded-xl border border-dashed border-gray-200 p-8 text-center text-sm text-gray-500 dark:border-gray-800">
          {status === "FLAGGED" ? "Nothing is waiting for review." : "Nothing here yet."}
        </p>
      ) : (
        <div className="space-y-4">{data?.flags.map((flag) => <FlagCard key={flag.id} flag={flag} />)}</div>
      )}

      {data && data.pages > 1 && <Pagination currentPage={page} totalPages={data.pages} onPageChange={setPage} />}
    </div>
  );
}
