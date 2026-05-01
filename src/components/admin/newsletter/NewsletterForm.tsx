"use client";
import React, { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import Button from "@/components/ui/button/Button";
import { useRecipientCount } from "@/services/hooks/useNewsletter";
import { useInfiniteContactLists } from "@/services/hooks/useContacts";
import { CreateNewsletterRequest, Newsletter } from "@/services/api/newsletter";
import { showToast } from "@/services/utils/toast";
import type { EmailBlock } from "./builder/utils/blockTypes";
import { MERGE_TAGS } from "./builder/utils/mergeTags";

// Dynamically import EmailBuilder to avoid SSR issues
const EmailBuilder = dynamic(
  () => import("./builder/EmailBuilder").then((m) => ({ default: m.EmailBuilder })),
  {
    ssr: false,
    loading: () => (
      <div className="h-[700px] rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500" />
      </div>
    ),
  }
);

export type SendMode = "draft" | "send" | "schedule";

export interface NewsletterFormValues {
  title: string;
  subject: string;
  content: string;
  builderBlocks: EmailBlock[];
  listIds: string[];
  scheduledAt: string;
  sendMode: SendMode;
  showHeader: boolean;
  showFooter: boolean;
}

interface NewsletterFormProps {
  initialValues?: Partial<Newsletter>;
  onSubmit: (values: NewsletterFormValues) => Promise<void>;
  isSubmitting?: boolean;
  defaultSendMode?: SendMode;
}

const NewsletterForm: React.FC<NewsletterFormProps> = ({
  initialValues,
  onSubmit,
  isSubmitting = false,
  defaultSendMode = "draft",
}) => {
  const router = useRouter();

  const [title, setTitle] = useState(initialValues?.title ?? "");
  const [subject, setSubject] = useState(initialValues?.subject ?? "");
  const [content, setContent] = useState(initialValues?.content ?? "");
  const [builderBlocks, setBuilderBlocks] = useState<EmailBlock[]>(
    (initialValues?.builderBlocks as EmailBlock[] | null | undefined) ?? []
  );
  const [sendMode, setSendMode] = useState<SendMode>(defaultSendMode);
  const [scheduledAt, setScheduledAt] = useState(
    initialValues?.scheduledAt
      ? new Date(initialValues.scheduledAt).toISOString().slice(0, 16)
      : ""
  );
  const [selectedListIds, setSelectedListIds] = useState<string[]>(
    Array.isArray((initialValues as any)?.listIds)
      ? (initialValues as any).listIds
      : []
  );
  const [listDropdownOpen, setListDropdownOpen] = useState(false);
  const [listSearch, setListSearch] = useState("");
  const [debouncedListSearch, setDebouncedListSearch] = useState("");
  const listSearchDebounceRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const listSentinelRef = React.useRef<HTMLDivElement | null>(null);
  const subjectRef = React.useRef<HTMLInputElement>(null);

  const insertMergeTagInSubject = (tag: string) => {
    const input = subjectRef.current;
    if (!input) {
      setSubject((prev) => prev + tag);
      return;
    }
    const start = input.selectionStart ?? subject.length;
    const end = input.selectionEnd ?? subject.length;
    const newValue = subject.slice(0, start) + tag + subject.slice(end);
    setSubject(newValue);
    requestAnimationFrame(() => {
      input.focus();
      const cursor = start + tag.length;
      input.setSelectionRange(cursor, cursor);
    });
  };

  // Close list dropdown when clicking outside
  const listDropdownRef = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    if (!listDropdownOpen) return;
    const handler = (e: MouseEvent) => {
      if (listDropdownRef.current && !listDropdownRef.current.contains(e.target as Node)) {
        setListDropdownOpen(false);
        setListSearch("");
        setDebouncedListSearch("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [listDropdownOpen]);
  const [showHeader, setShowHeader] = useState(
    initialValues?.showHeader !== undefined ? initialValues.showHeader : true
  );
  const [showFooter, setShowFooter] = useState(
    initialValues?.showFooter !== undefined ? initialValues.showFooter : true
  );

  const { data: listsData, isLoading: listsLoading, isFetchingNextPage, hasNextPage, fetchNextPage } =
    useInfiniteContactLists(debouncedListSearch || undefined);
  const allLoadedLists = listsData?.pages.flatMap((p) => p.data) ?? [];
  const listLookup = React.useMemo(
    () => new Map(allLoadedLists.map((l) => [l.id, l])),
    [allLoadedLists]
  );

  const handleListSearch = (value: string) => {
    setListSearch(value);
    if (listSearchDebounceRef.current) clearTimeout(listSearchDebounceRef.current);
    listSearchDebounceRef.current = setTimeout(() => {
      setDebouncedListSearch(value);
    }, 300);
  };

  // Infinite scroll: fire fetchNextPage when the sentinel enters the viewport
  const handleListObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
    [hasNextPage, isFetchingNextPage, fetchNextPage]
  );

  React.useEffect(() => {
    if (!listDropdownOpen) return;
    const sentinel = listSentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(handleListObserver, { threshold: 0.1 });
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [listDropdownOpen, handleListObserver]);

  // Auto-resolve: on edit page, keep fetching until all pre-selected IDs are present in the lookup
  React.useEffect(() => {
    if (selectedListIds.length === 0) return;
    const allResolved = selectedListIds.every((id) => listLookup.has(id));
    if (!allResolved && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [listsData, selectedListIds, listLookup, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const { data: countData } = useRecipientCount(
    "all",
    undefined,
    selectedListIds.length > 0 ? selectedListIds : undefined
  );
  const recipientCount = countData?.data?.count ?? null;

  const handleSubmit = async (e: React.FormEvent, mode: SendMode) => {
    e.preventDefault();

    if (!title.trim()) {
      showToast.error("Validation", "Title is required");
      return;
    }
    if (!subject.trim()) {
      showToast.error("Validation", "Subject is required");
      return;
    }
    if (builderBlocks.length === 0) {
      showToast.error("Validation", "Add at least one block to your email");
      return;
    }
    if (!content.trim() || content === "<p></p>") {
      showToast.error("Validation", "Content cannot be empty — add blocks to your email");
      return;
    }
    if (mode === "schedule" && !scheduledAt) {
      showToast.error("Validation", "Please select a date and time to schedule");
      return;
    }
    if (mode === "schedule" && new Date(scheduledAt) <= new Date()) {
      showToast.error("Validation", "Scheduled time must be in the future");
      return;
    }

    await onSubmit({
      title: title.trim(),
      subject: subject.trim(),
      content,
      builderBlocks,
      listIds: selectedListIds,
      scheduledAt,
      sendMode: mode,
      showHeader,
      showFooter,
    });
  };

  return (
    <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Internal Title <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., April 2026 Newsletter"
          maxLength={200}
          className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
        <p className="mt-1 text-xs text-gray-400">
          Only visible to admins — not sent to recipients
        </p>
      </div>

      {/* Subject */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Email Subject <span className="text-red-500">*</span>
        </label>
        <input
          ref={subjectRef}
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="e.g., Exciting updates from Gotham Enterprises!"
          maxLength={200}
          className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
        <div className="mt-2 flex flex-wrap gap-1.5 items-center">
          <span className="text-xs text-gray-400 dark:text-gray-500 shrink-0">Merge tags:</span>
          {MERGE_TAGS.map(({ label, tag }) => (
            <button
              key={tag}
              type="button"
              onClick={() => insertMergeTagInSubject(tag)}
              title={`Insert ${tag}`}
              className="px-2 py-0.5 text-xs rounded border border-brand-300 dark:border-brand-700 bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400 hover:bg-brand-100 dark:hover:bg-brand-900/40 transition-colors font-mono"
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Target Audience (Lists) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Target Audience
        </label>
        <p className="text-xs text-gray-400 dark:text-gray-500 mb-2">
          Select which lists receive this newsletter. If none are selected, it sends to all users.
        </p>

        <div className="relative" ref={listDropdownRef}>
          {/* Trigger */}
          <button
            onClick={() => setListDropdownOpen((v) => !v)}
            className="w-full flex items-center justify-between rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 text-left"
          >
            <span className="flex flex-wrap gap-1 flex-1 min-w-0">
              {selectedListIds.length === 0 ? (
                <span className="text-gray-400">No lists selected (sends to all users)</span>
              ) : (
                selectedListIds.map((id) => {
                  const l = listLookup.get(id);
                  return (
                    <span
                      key={id}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 text-xs font-medium"
                    >
                      {l ? l.name : id}
                      <span
                        role="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedListIds((prev) => prev.filter((sid) => sid !== id));
                        }}
                        className="cursor-pointer hover:text-brand-900 dark:hover:text-brand-100 leading-none"
                      >
                        ×
                      </span>
                    </span>
                  );
                })
              )}
            </span>
            <svg
              className={`ml-2 h-4 w-4 flex-shrink-0 text-gray-400 transition-transform ${listDropdownOpen ? "rotate-180" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Dropdown */}
          {listDropdownOpen && (
            <div className="absolute z-20 mt-1 w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-lg overflow-hidden">
              {/* Search input */}
              <div className="p-2 border-b border-gray-100 dark:border-gray-800">
                <input
                  type="text"
                  value={listSearch}
                  onChange={(e) => handleListSearch(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  placeholder="Search lists by name…"
                  autoFocus
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              {listsLoading ? (
                <div className="flex justify-center items-center h-16">
                  <svg className="animate-spin h-5 w-5 text-brand-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                </div>
              ) : allLoadedLists.length === 0 ? (
                <p className="px-4 py-3 text-sm text-gray-400">
                  {debouncedListSearch
                    ? "No lists match your search."
                    : "No lists available — create lists in the Contacts tab first."}
                </p>
              ) : (
                <div className="max-h-56 overflow-y-auto">
                  {allLoadedLists.map((list) => {
                    const checked = selectedListIds.includes(list.id);
                    return (
                      <label
                        key={list.id}
                        className="flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => {
                            setSelectedListIds((prev) =>
                              checked
                                ? prev.filter((id) => id !== list.id)
                                : [...prev, list.id]
                            );
                          }}
                          className="accent-brand-500 h-4 w-4 cursor-pointer flex-shrink-0"
                        />
                        <span className="flex-1 text-sm text-gray-800 dark:text-gray-200">
                          {list.name}
                        </span>
                        <span className="text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap">
                          {list.contactCount.toLocaleString()} contact{list.contactCount !== 1 ? "s" : ""}
                        </span>
                        {list.isSystem && (
                          <span className="text-xs px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 font-medium">
                            System
                          </span>
                        )}
                      </label>
                    );
                  })}

                  {/* Infinite scroll sentinel */}
                  <div ref={listSentinelRef} className="h-1" />

                  {isFetchingNextPage && (
                    <div className="flex justify-center py-2">
                      <svg className="animate-spin h-4 w-4 text-brand-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Recipient count badge */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-500 dark:text-gray-400">
          Estimated recipients:
        </span>
        {recipientCount !== null ? (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
            {recipientCount.toLocaleString()} user{recipientCount !== 1 ? "s" : ""}
          </span>
        ) : (
          <span className="text-sm text-gray-400 dark:text-gray-500">
            Calculating...
          </span>
        )}
      </div>

      {/* Email Builder */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Email Content <span className="text-red-500">*</span>
        </label>
        <p className="text-xs text-gray-400 dark:text-gray-500 mb-3">
          Drag blocks from the left panel onto the canvas. Click any block to edit its properties on the right.
        </p>

        <EmailBuilder
          initialBlocks={builderBlocks}
          subject={subject}
          showHeader={showHeader}
          showFooter={showFooter}
          onShowHeaderChange={(v) => setShowHeader(v)}
          onShowFooterChange={(v) => setShowFooter(v)}
          onChange={(blocks, html) => {
            setBuilderBlocks(blocks);
            setContent(html);
          }}
        />
      </div>

      {/* Send Mode */}
      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Send Options
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="sendMode"
              value="draft"
              checked={sendMode === "draft"}
              onChange={() => setSendMode("draft")}
              className="accent-brand-500"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Save as Draft
            </span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="sendMode"
              value="send"
              checked={sendMode === "send"}
              onChange={() => setSendMode("send")}
              className="accent-brand-500"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Send Now
            </span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="sendMode"
              value="schedule"
              checked={sendMode === "schedule"}
              onChange={() => setSendMode("schedule")}
              className="accent-brand-500"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Schedule
            </span>
          </label>
        </div>

        {sendMode === "schedule" && (
          <div className="mt-3">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Schedule Date & Time <span className="text-red-500">*</span>
            </label>
            <input
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              min={new Date(Date.now() + 60000).toISOString().slice(0, 16)}
              className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-2">
        <Button
          variant="outline"
          size="default"
          onClick={() => router.push("/admin/newsletters")}
          disabled={isSubmitting}
        >
          Cancel
        </Button>

        <div className="flex items-center gap-3">
          {sendMode !== "draft" && (
            <Button
              variant="outline"
              size="default"
              onClick={() => {
                const fakeEvent = { preventDefault: () => {} } as React.FormEvent;
                handleSubmit(fakeEvent, "draft");
              }}
              disabled={isSubmitting}
            >
              Save as Draft
            </Button>
          )}

          <Button
            variant="default"
            size="default"
            onClick={() => {
              const fakeEvent = { preventDefault: () => {} } as React.FormEvent;
              handleSubmit(fakeEvent, sendMode);
            }}
            disabled={isSubmitting}
          >
            {isSubmitting
              ? "Processing..."
              : sendMode === "draft"
                ? "Save Draft"
                : sendMode === "send"
                  ? "Send Now"
                  : "Schedule"}
          </Button>
        </div>
      </div>
    </form>
  );
};

export default NewsletterForm;
