"use client";

import React, { useEffect, useState } from "react";
import InquiryDealPanel from "./InquiryDealPanel";
import InquiryCreditsPanel from "./InquiryCreditsPanel";
import { CheckCircle, ExternalLink, Mail, Phone, X, XCircle } from "lucide-react";
import { INQUIRY_STATUSES, type CampaignInquiry, type InquiryStatus } from "@/services/api/campaignInquiries";
import { useUpdateCampaignInquiry } from "@/services/hooks/useCampaignInquiries";
import {
  CAMPAIGN_TYPE_LABELS,
  HEARD_ABOUT_LABELS,
  ORGANIZATION_LABELS,
  STATUS_LABELS,
  STATUS_STYLES,
  callIsLive,
  callStatusLabel,
  formatCallTime,
  formatDateTime,
} from "./labels";

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div>
    <dt className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">{label}</dt>
    <dd className="mt-1 text-sm text-gray-900 dark:text-white break-words">{children || <span className="text-gray-400">Not Provided</span>}</dd>
  </div>
);

// The website is free text. Only a real web address becomes a link; anything else is shown as plain text.
const asWebLink = (value: string | null): string | null => {
  if (!value) return null;
  try {
    const url = new URL(/^https?:\/\//i.test(value) ? value : `https://${value}`);
    return /^https?:$/.test(url.protocol) && url.hostname.includes(".") && !/\s/.test(value) ? url.toString() : null;
  } catch {
    return null;
  }
};

const Sent = ({ at, label }: { at: string | null; label: string }) => (
  <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
    {at ? <CheckCircle className="h-4 w-4 text-green-500" /> : <XCircle className="h-4 w-4 text-red-500" />}
    <span>{label}</span>
    <span className="text-xs text-gray-500">{at ? formatDateTime(at) : "not sent"}</span>
  </div>
);

interface Props {
  inquiry: CampaignInquiry | null;
  onClose: () => void;
}

// Slide-over with everything the visitor submitted, plus the fields the Gotham team works with.
export default function InquiryDetailPanel({ inquiry, onClose }: Props) {
  const update = useUpdateCampaignInquiry();
  const [status, setStatus] = useState<InquiryStatus>("NEW");
  const [assignedTo, setAssignedTo] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (!inquiry) return;
    setStatus(inquiry.status);
    setAssignedTo(inquiry.assignedTo ?? "");
    setNotes(inquiry.internalNotes ?? "");
  }, [inquiry]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!inquiry) return null;

  const dirty =
    status !== inquiry.status || assignedTo !== (inquiry.assignedTo ?? "") || notes !== (inquiry.internalNotes ?? "");

  const save = () =>
    update.mutate({
      id: inquiry.id,
      status,
      assignedTo: assignedTo.trim() || null,
      internalNotes: notes.trim() || null,
    });

  return (
    <div className="fixed inset-0 z-[100000] flex justify-end bg-black/40" onClick={onClose}>
      <aside
        className="h-full w-full max-w-xl overflow-y-auto bg-white p-6 shadow-xl dark:bg-gray-900"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-label={`Inquiry ${inquiry.referenceCode}`}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Inquiry</p>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{inquiry.referenceCode}</h2>
            <p className="mt-1 text-sm text-gray-500">Received {formatDateTime(inquiry.createdAt)}</p>
          </div>
          <button onClick={onClose} aria-label="Close" className="rounded-md p-1 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800">
            <X className="h-5 w-5" />
          </button>
        </div>

        <section className="mt-6 rounded-lg border border-gray-200 p-4 dark:border-gray-800">
          <h3 className="mb-3 text-sm font-semibold text-gray-900 dark:text-white">Contact</h3>
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Name">{`${inquiry.firstName} ${inquiry.lastName}`}</Field>
            <Field label="Company">{inquiry.companyName}</Field>
            <Field label="Email">
              <a href={`mailto:${inquiry.email}`} className="inline-flex items-center gap-1 text-primary hover:underline">
                <Mail className="h-3.5 w-3.5" /> {inquiry.email}
              </a>
            </Field>
            <Field label="Phone">
              <a href={`tel:${inquiry.phoneNumber}`} className="inline-flex items-center gap-1 text-primary hover:underline">
                <Phone className="h-3.5 w-3.5" /> {inquiry.phoneNumber}
              </a>
            </Field>
            {/* Website, audience and how they heard about us are no longer asked: show them only on older inquiries. */}
            {inquiry.website && (
            <Field label="Website">
              {inquiry.website &&
                (asWebLink(inquiry.website) ? (
                  <a href={asWebLink(inquiry.website)!} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline">
                    {inquiry.website.replace(/^https?:\/\//, "")} <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                ) : (
                  <span>{inquiry.website}</span>
                ))}
            </Field>
            )}
            <Field label="Type of Organization">{ORGANIZATION_LABELS[inquiry.organizationType] ?? inquiry.organizationType}</Field>
          </dl>
        </section>

        <section className="mt-4 rounded-lg border border-gray-200 p-4 dark:border-gray-800">
          <h3 className="mb-3 text-sm font-semibold text-gray-900 dark:text-white">Campaign Brief</h3>
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Campaign">{inquiry.campaignType ? CAMPAIGN_TYPE_LABELS[inquiry.campaignType] : "Not Chosen"}</Field>
            <Field label="Company Size">{inquiry.companySize ? `${inquiry.companySize} employees` : null}</Field>
            {inquiry.estimatedAudienceSize && <Field label="Estimated Audience">{inquiry.estimatedAudienceSize}</Field>}
            {inquiry.howDidYouHear && <Field label="Heard About Us">{HEARD_ABOUT_LABELS[inquiry.howDidYouHear] ?? inquiry.howDidYouHear}</Field>}
            <div className="sm:col-span-2"><Field label="Primary Goal"><span className="whitespace-pre-wrap">{inquiry.primaryGoal}</span></Field></div>
            <div className="sm:col-span-2"><Field label="Message"><span className="whitespace-pre-wrap">{inquiry.notes}</span></Field></div>
          </dl>
        </section>

        <section className="mt-4 rounded-lg border border-gray-200 p-4 dark:border-gray-800">
          <h3 className="mb-3 text-sm font-semibold text-gray-900 dark:text-white">Call</h3>
          {inquiry.call ? (
            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="When">{formatCallTime(inquiry.call.startAt, inquiry.call.timezone)}</Field>
              <Field label="With">{inquiry.call.host ? `${inquiry.call.host.name}, ${inquiry.call.host.title}` : "No Host Set"}</Field>
              <Field label="Status">
                <span className={callIsLive(inquiry.call.status) ? "" : "text-amber-700"}>{callStatusLabel(inquiry.call.status)}</span>
              </Field>
              <Field label="Booking Reference">{inquiry.call.referenceNumber}</Field>
              {inquiry.call.zoomLink && (
                <div className="sm:col-span-2">
                  <Field label="Meeting Link">
                    <a href={inquiry.call.zoomLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline">
                      Join the Call <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </Field>
                </div>
              )}
            </dl>
          ) : (
            <p className="m-0 text-sm text-gray-500">No call booked yet. A call shows here once this person books one with the same email address.</p>
          )}
        </section>

        <InquiryCreditsPanel key={inquiry.id} inquiry={inquiry} />

        <InquiryDealPanel inquiryId={inquiry.id} />

        <section className="mt-4 rounded-lg border border-gray-200 p-4 dark:border-gray-800">
          <h3 className="mb-3 text-sm font-semibold text-gray-900 dark:text-white">Follow-Up</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="text-sm">
              <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-gray-500">Status</span>
              <select
                value={status}
                onChange={(event) => setStatus(event.target.value as InquiryStatus)}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              >
                {INQUIRY_STATUSES.map((value) => (
                  <option key={value} value={value}>{STATUS_LABELS[value]}</option>
                ))}
              </select>
            </label>
            <label className="text-sm">
              <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-gray-500">Owner</span>
              <input
                value={assignedTo}
                onChange={(event) => setAssignedTo(event.target.value)}
                maxLength={120}
                placeholder="Who is handling this?"
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
            </label>
            <label className="text-sm sm:col-span-2">
              <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-gray-500">Internal Notes (never shown to the visitor)</span>
              <textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                maxLength={4000}
                rows={4}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
            </label>
          </div>
          {inquiry.reviewedAt && <p className="mt-3 text-xs text-gray-500">First picked up {formatDateTime(inquiry.reviewedAt)}</p>}
          <button
            onClick={save}
            disabled={!dirty || update.isPending}
            className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {update.isPending ? "Saving…" : "Save Changes"}
          </button>
        </section>

        <section className="mt-4 rounded-lg border border-gray-200 p-4 dark:border-gray-800">
          <h3 className="mb-3 text-sm font-semibold text-gray-900 dark:text-white">Emails</h3>
          <div className="space-y-2">
            <Sent at={inquiry.teamNotifiedAt} label="Team Notification" />
            <Sent at={inquiry.acknowledgedAt} label="Confirmation to the Visitor" />
          </div>
          {inquiry.notifyError && (
            <p className="mt-3 rounded-md bg-red-50 p-2 text-xs text-red-700 dark:bg-red-900/20 dark:text-red-300">
              Email problem: {inquiry.notifyError}
            </p>
          )}
        </section>

        <span className={`mt-4 inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[inquiry.status]}`}>
          Currently {STATUS_LABELS[inquiry.status]}
        </span>
      </aside>
    </div>
  );
}
