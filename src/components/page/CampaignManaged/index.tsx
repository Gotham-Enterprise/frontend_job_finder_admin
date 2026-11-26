"use client";

import React, { useRef, useState } from "react";
import Link from "next/link";
import { Inbox, Search, Sparkles } from "lucide-react";
import Pagination from "@/components/tables/Pagination";
import type { ManagedTab } from "@/services/api/campaignManaged";
import { useManagedCampaigns } from "@/services/hooks/useCampaignManaged";
import { CHANNEL_LABELS, STATUS_LABELS, STATUS_STYLES, formatDateTime } from "./labels";

const PAGE_SIZE = 15;
const TABS: { id: ManagedTab; label: string }[] = [
  { id: "TO_PREPARE", label: "To Prepare" },
  { id: "AWAITING_APPROVAL", label: "Awaiting Approval" },
  { id: "AWAITING_DETAILS", label: "Awaiting Details" },
  { id: "LIVE", label: "Live & Completed" },
  { id: "ALL", label: "All" },
];

// The queue of campaigns employers asked Gotham to run.
export default function CampaignManaged() {
  const [tab, setTab] = useState<ManagedTab>("TO_PREPARE");
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { data, isLoading, isError, refetch } = useManagedCampaigns({ tab, page, limit: PAGE_SIZE, search: search || undefined });

  const onSearch = (value: string) => {
    setSearchInput(value);
    if (debounce.current) clearTimeout(debounce.current);
    debounce.current = setTimeout(() => {
      setSearch(value.trim());
      setPage(1);
    }, 300);
  };

  return (
    <div className="w-full max-w-full overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="border-b border-gray-200 p-6 dark:border-gray-800">
        <div className="flex items-center gap-3">
          <Sparkles className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Managed Campaigns</h1>
        </div>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Campaigns employers asked Gotham to run. Prepare the audience and message, then send it to the employer for approval.
        </p>
      </div>

      <div className="space-y-4 p-6">
        <div className="flex flex-wrap gap-2">
          {TABS.map((item) => {
            const active = tab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setTab(item.id);
                  setPage(1);
                }}
                className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm transition-colors ${
                  active
                    ? "border-primary bg-primary text-white"
                    : "border-gray-200 bg-white text-gray-700 hover:border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                }`}
              >
                <span className="font-medium">{item.label}</span>
                <span className={`rounded-full px-1.5 text-xs ${active ? "bg-white/20" : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"}`}>
                  {data?.tabCounts[item.id] ?? "–"}
                </span>
              </button>
            );
          })}
        </div>

        <div className="relative max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            value={searchInput}
            onChange={(event) => onSearch(event.target.value)}
            placeholder="Search job title or company"
            className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm text-gray-900 placeholder-gray-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          />
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-primary" />
          </div>
        ) : isError ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center text-sm text-red-700 dark:border-red-900/50 dark:bg-red-900/10 dark:text-red-300">
            We couldn’t load the campaigns.{" "}
            <button onClick={() => refetch()} className="font-semibold underline">Try again</button>
          </div>
        ) : !data || data.campaigns.length === 0 ? (
          <div className="flex flex-col items-center py-14 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
              <Inbox className="h-7 w-7 text-gray-400" />
            </span>
            <p className="mt-4 text-sm font-semibold text-gray-900 dark:text-white">
              {search ? "No campaigns match your search" : "Nothing here"}
            </p>
            <p className="mt-1 max-w-sm text-sm text-gray-500 dark:text-gray-400">
              {tab === "TO_PREPARE" && !search ? "When an employer sends their campaign details, it appears here for you to prepare." : "Try another tab or a different search."}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-800">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-900/50">
                  <tr>
                    {["Campaign", "Employer", "Channels", "Audience", "Status", "Updated"].map((heading) => (
                      <th key={heading} className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">{heading}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-800 dark:bg-transparent">
                  {data.campaigns.map((row) => (
                    <tr key={row.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/50">
                      <td className="px-4 py-3 text-sm">
                        <Link href={`/admin/campaigns/managed/${row.id}`} className="font-semibold text-primary hover:underline">
                          {row.jobTitle ?? row.name}
                        </Link>
                        {row.cityState && <div className="text-xs text-gray-500">{row.cityState}</div>}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div className="font-medium text-gray-900 dark:text-white">{row.companyName}</div>
                        {row.requestedBy && <div className="text-xs text-gray-500">{row.requestedBy.name} · {row.requestedBy.email}</div>}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                        {row.channels.map((channel) => CHANNEL_LABELS[channel]).join(" + ")}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                        {row.matchedCount != null ? `${row.matchedCount.toLocaleString()} candidates` : <span className="text-gray-400">Not set</span>}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[row.status]}`}>{STATUS_LABELS[row.status]}</span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">{formatDateTime(row.updatedAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {data.pages > 1 && (
              <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Page {data.page} of {data.pages} ({data.total} campaigns)
                </p>
                <Pagination currentPage={page} totalPages={data.pages} onPageChange={setPage} />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
