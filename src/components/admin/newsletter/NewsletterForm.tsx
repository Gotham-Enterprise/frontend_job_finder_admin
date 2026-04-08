"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import Button from "@/components/ui/button/Button";
import { useRecipientCount } from "@/services/hooks/useNewsletter";
import { CreateNewsletterRequest, Newsletter } from "@/services/api/newsletter";
import { showToast } from "@/services/utils/toast";
import type { EmailBlock } from "./builder/utils/blockTypes";

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
  targetAudience: "all" | "job-seeker" | "employer";
  filters: { country: string; state: string };
  scheduledAt: string;
  sendMode: SendMode;
}

interface NewsletterFormProps {
  initialValues?: Partial<Newsletter>;
  onSubmit: (values: NewsletterFormValues) => Promise<void>;
  isSubmitting?: boolean;
  defaultSendMode?: SendMode;
}

const AUDIENCE_OPTIONS = [
  { value: "all", label: "All Users (Job Seekers + Employers)" },
  { value: "job-seeker", label: "Job Seekers only" },
  { value: "employer", label: "Employers only" },
];

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
  const [targetAudience, setTargetAudience] = useState<
    "all" | "job-seeker" | "employer"
  >((initialValues?.targetAudience as any) ?? "all");
  const [country, setCountry] = useState(
    (initialValues?.filters as any)?.country ?? ""
  );
  const [state, setState] = useState(
    (initialValues?.filters as any)?.state ?? ""
  );
  const [sendMode, setSendMode] = useState<SendMode>(defaultSendMode);
  const [scheduledAt, setScheduledAt] = useState(
    initialValues?.scheduledAt
      ? new Date(initialValues.scheduledAt).toISOString().slice(0, 16)
      : ""
  );

  const filters = { country: country || undefined, state: state || undefined };
  const { data: countData } = useRecipientCount(targetAudience, filters);
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
      targetAudience,
      filters: { country: country.trim(), state: state.trim() },
      scheduledAt,
      sendMode: mode,
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
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="e.g., Exciting updates from Gotham Enterprises!"
          maxLength={200}
          className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
      </div>

      {/* Audience + Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Target Audience
          </label>
          <select
            value={targetAudience}
            onChange={(e) =>
              setTargetAudience(e.target.value as typeof targetAudience)
            }
            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            {AUDIENCE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Filter by Country{" "}
            <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <input
            type="text"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            placeholder="e.g., United States"
            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Filter by State{" "}
            <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <input
            type="text"
            value={state}
            onChange={(e) => setState(e.target.value)}
            placeholder="e.g., California"
            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
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
