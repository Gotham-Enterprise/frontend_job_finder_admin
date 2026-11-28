"use client";

import React, { useRef, useState } from "react";
import { ChevronDown, Inbox, MessageSquareText, Search, X } from "lucide-react";
import Pagination from "@/components/tables/Pagination";
import {
  INQUIRY_STATUSES,
  type CampaignInquiry,
  type InquiryCampaignType,
  type InquiryStatus,
} from "@/services/api/campaignInquiries";
import { useCampaignInquiries, useCampaignInquiryStats } from "@/services/hooks/useCampaignInquiries";
import InquiryDetailPanel from "./InquiryDetailPanel";
import { CAMPAIGN_TYPE_LABELS, STATUS_DOTS, STATUS_LABELS, STATUS_STYLES, callIsLive, callStatusLabel, formatCallTime, formatDateTime } from "./labels";

const PAGE_SIZE = 15;

export default function CampaignInquiries() {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<InquiryStatus | "">("");
  const [campaignType, setCampaignType] = useState<InquiryCampaignType | "">("");
  const [openId, setOpenId] = useState<string | null>(null);
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { data, isLoading, isError, refetch } = useCampaignInquiries({
    page,
    limit: PAGE_SIZE,
    search: search || undefined,
    status: status || undefined,
    campaignType: campaignType || undefined,
  });
  const { data: stats } = useCampaignInquiryStats();

  const onSearch = (value: string) => {
    setSearchInput(value);
    if (debounce.current) clearTimeout(debounce.current);
    debounce.current = setTimeout(() => {
      setSearch(value.trim());
      setPage(1);
    }, 300);
  };
  const pickStatus = (value: InquiryStatus | "") => {
    setStatus(value);
    setPage(1);
  };
  const filtering = Boolean(search || status || campaignType);
  const clearFilters = () => {
    setSearchInput("");
    setSearch("");
    setStatus("");
    setCampaignType("");
    setPage(1);
  };

  // The panel shows the latest copy of the row, so a save is reflected straight away.
  const open: CampaignInquiry | null = data?.inquiries.find((row) => row.id === openId) ?? null;

  const chips: { key: InquiryStatus | ""; label: string; value: number | undefined; dot?: string }[] = [
    { key: "", label: "All", value: stats?.total },
    ...INQUIRY_STATUSES.map((value) => ({ key: value, label: STATUS_LABELS[value], value: stats?.byStatus[value], dot: STATUS_DOTS[value] })),
  ];

  return (
    <div className="w-full max-w-full overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-gray-200 p-6 dark:border-gray-800">
        <div>
          <div className="flex items-center gap-3">
            <MessageSquareText className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Campaign Inquiries</h1>
          </div>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            People who asked Gotham to run a text or email campaign, from the “Start hiring with Gotham” form.
          </p>
        </div>
        {stats && (
          <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700 dark:bg-gray-800 dark:text-gray-300">
            {stats.lastSevenDays} in the last 7 days
          </span>
        )}
      </div>

      <div className="space-y-4 p-6">
        {/* Status filter chips */}
        <div className="flex flex-wrap gap-2">
          {chips.map((chip) => {
            const active = status === chip.key;
            return (
              <button
                key={chip.label}
                onClick={() => pickStatus(chip.key)}
                className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm transition-colors ${
                  active
                    ? "border-primary bg-primary text-white"
                    : "border-gray-200 bg-white text-gray-700 hover:border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                }`}
              >
                {chip.dot && <span className={`h-2 w-2 rounded-full ${chip.dot}`} />}
                <span className="font-medium">{chip.label}</span>
                <span className={`rounded-full px-1.5 text-xs ${active ? "bg-white/20" : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"}`}>
                  {chip.value ?? "–"}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search and filters */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative max-w-md flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              value={searchInput}
              onChange={(event) => onSearch(event.target.value)}
              placeholder="Search name, company, email or reference code"
              className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm text-gray-900 placeholder-gray-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
          </div>
          <div className="relative">
            <select
              value={campaignType}
              onChange={(event) => {
                setCampaignType(event.target.value as InquiryCampaignType | "");
                setPage(1);
              }}
              className="w-full appearance-none rounded-lg border border-gray-200 bg-white py-2 pl-3 pr-9 text-sm text-gray-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-gray-700 dark:bg-gray-800 dark:text-white sm:w-52"
            >
              <option value="">All Campaign Types</option>
              {(Object.keys(CAMPAIGN_TYPE_LABELS) as InquiryCampaignType[]).map((value) => (
                <option key={value} value={value}>{CAMPAIGN_TYPE_LABELS[value]}</option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          </div>
          {filtering && (
            <button onClick={clearFilters} className="inline-flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
              <X className="h-4 w-4" /> Clear Filters
            </button>
          )}
        </div>

        {/* Results */}
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-primary" />
          </div>
        ) : isError ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center text-sm text-red-700 dark:border-red-900/50 dark:bg-red-900/10 dark:text-red-300">
            We couldn’t load the inquiries.{" "}
            <button onClick={() => refetch()} className="font-semibold underline">Try Again</button>
          </div>
        ) : !data || data.inquiries.length === 0 ? (
          <div className="flex flex-col items-center py-14 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
              <Inbox className="h-7 w-7 text-gray-400" />
            </span>
            <p className="mt-4 text-sm font-semibold text-gray-900 dark:text-white">
              {filtering ? "No Inquiries Match Your Filters" : "No Inquiries Yet"}
            </p>
            <p className="mt-1 max-w-sm text-sm text-gray-500 dark:text-gray-400">
              {filtering ? "Try a different search or clear the filters." : "When someone submits the campaigns form, their inquiry will appear here."}
            </p>
            {filtering && (
              <button onClick={clearFilters} className="mt-4 rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800">
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-800">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-900/50">
                  <tr>
                    {["Reference", "Contact", "Campaign", "Company Size", "Status", "Owner", "Call", "Received"].map((heading) => (
                      <th key={heading} className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">{heading}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-800 dark:bg-transparent">
                  {data.inquiries.map((row) => (
                    <tr key={row.id} onClick={() => setOpenId(row.id)} className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900/50">
                      <td className="whitespace-nowrap px-4 py-3 text-sm font-semibold text-primary">{row.referenceCode}</td>
                      <td className="px-4 py-3 text-sm">
                        <div className="font-medium text-gray-900 dark:text-white">{row.firstName} {row.lastName}</div>
                        <div className="text-xs text-gray-500">{row.companyName}</div>
                        <div className="text-xs text-gray-400">{row.email}</div>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                        {row.campaignType ? CAMPAIGN_TYPE_LABELS[row.campaignType] : <span className="text-gray-400">Not Chosen</span>}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{row.companySize ? `${row.companySize} employees` : row.estimatedAudienceSize ?? <span className="text-gray-400">–</span>}</td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[row.status]}`}>{STATUS_LABELS[row.status]}</span>
                        {row.notifyError && <span title={row.notifyError} className="ml-2 text-xs text-red-600">Email Issue</span>}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{row.assignedTo ?? <span className="text-gray-400">Unassigned</span>}</td>
                      <td className="px-4 py-3 text-sm">
                        {row.call ? (
                          <>
                            <div className={`whitespace-nowrap ${callIsLive(row.call.status) ? "font-medium text-gray-900 dark:text-white" : "text-gray-500 line-through"}`}>
                              {formatCallTime(row.call.startAt, row.call.timezone)}
                            </div>
                            <div className="text-xs text-gray-500">
                              {row.call.host ? `with ${row.call.host.name}` : "no host set"}
                              {!callIsLive(row.call.status) && ` · ${callStatusLabel(row.call.status)}`}
                            </div>
                          </>
                        ) : (
                          <span className="text-gray-400">No Call Booked</span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">{formatDateTime(row.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {data.pages > 1 && (
              <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Page {data.page} of {data.pages} ({data.total} inquiries)
                </p>
                <Pagination currentPage={page} totalPages={data.pages} onPageChange={setPage} />
              </div>
            )}
          </>
        )}
      </div>

      <InquiryDetailPanel inquiry={open} onClose={() => setOpenId(null)} />
    </div>
  );
}
