"use client";

import React, { useEffect, useState } from "react";
import EnquiryDealPanel from "./EnquiryDealPanel";
import EnquiryCreditsPanel from "./EnquiryCreditsPanel";
import { CheckCircle, ExternalLink, Mail, Phone, X, XCircle } from "lucide-react";
import { ENQUIRY_STATUSES, type CampaignEnquiry, type EnquiryStatus } from "@/services/api/campaignEnquiries";
import { useUpdateCampaignEnquiry } from "@/services/hooks/useCampaignEnquiries";
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
    <dd className="mt-1 text-sm text-gray-900 dark:text-white break-words">{children || <span className="text-gray-400">Not provided</span>}</dd>
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
  enquiry: CampaignEnquiry | null;
  onClose: () => void;
}

// Slide-over with everything the visitor submitted, plus the fields the Gotham team works with.
export default function EnquiryDetailPanel({ enquiry, onClose }: Props) {
  const update = useUpdateCampaignEnquiry();
  const [status, setStatus] = useState<EnquiryStatus>("NEW");
  const [assignedTo, setAssignedTo] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (!enquiry) return;
    setStatus(enquiry.status);
    setAssignedTo(enquiry.assignedTo ?? "");
    setNotes(enquiry.internalNotes ?? "");
  }, [enquiry]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!enquiry) return null;

  const dirty =
    status !== enquiry.status || assignedTo !== (enquiry.assignedTo ?? "") || notes !== (enquiry.internalNotes ?? "");

  const save = () =>
    update.mutate({
      id: enquiry.id,
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
        aria-label={`Enquiry ${enquiry.referenceCode}`}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Enquiry</p>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{enquiry.referenceCode}</h2>
            <p className="mt-1 text-sm text-gray-500">Received {formatDateTime(enquiry.createdAt)}</p>
          </div>
          <button onClick={onClose} aria-label="Close" className="rounded-md p-1 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800">
            <X className="h-5 w-5" />
          </button>
        </div>

        <section className="mt-6 rounded-lg border border-gray-200 p-4 dark:border-gray-800">
          <h3 className="mb-3 text-sm font-semibold text-gray-900 dark:text-white">Contact</h3>
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Name">{`${enquiry.firstName} ${enquiry.lastName}`}</Field>
            <Field label="Company">{enquiry.companyName}</Field>
            <Field label="Email">
              <a href={`mailto:${enquiry.email}`} className="inline-flex items-center gap-1 text-primary hover:underline">
                <Mail className="h-3.5 w-3.5" /> {enquiry.email}
              </a>
            </Field>
            <Field label="Phone">
              <a href={`tel:${enquiry.phoneNumber}`} className="inline-flex items-center gap-1 text-primary hover:underline">
                <Phone className="h-3.5 w-3.5" /> {enquiry.phoneNumber}
              </a>
            </Field>
            {/* Website, audience and how they heard about us are no longer asked: show them only on older enquiries. */}
            {enquiry.website && (
            <Field label="Website">
              {enquiry.website &&
                (asWebLink(enquiry.website) ? (
                  <a href={asWebLink(enquiry.website)!} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline">
                    {enquiry.website.replace(/^https?:\/\//, "")} <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                ) : (
                  <span>{enquiry.website}</span>
                ))}
            </Field>
            )}
            <Field label="Type of Organisation">{ORGANIZATION_LABELS[enquiry.organizationType] ?? enquiry.organizationType}</Field>
          </dl>
        </section>

        <section className="mt-4 rounded-lg border border-gray-200 p-4 dark:border-gray-800">
          <h3 className="mb-3 text-sm font-semibold text-gray-900 dark:text-white">Campaign Brief</h3>
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Campaign">{enquiry.campaignType ? CAMPAIGN_TYPE_LABELS[enquiry.campaignType] : "Not chosen"}</Field>
            <Field label="Company Size">{enquiry.companySize ? `${enquiry.companySize} employees` : null}</Field>
            {enquiry.estimatedAudienceSize && <Field label="Estimated Audience">{enquiry.estimatedAudienceSize}</Field>}
            {enquiry.howDidYouHear && <Field label="Heard About Us">{HEARD_ABOUT_LABELS[enquiry.howDidYouHear] ?? enquiry.howDidYouHear}</Field>}
            <div className="sm:col-span-2"><Field label="Primary Goal"><span className="whitespace-pre-wrap">{enquiry.primaryGoal}</span></Field></div>
            <div className="sm:col-span-2"><Field label="Message"><span className="whitespace-pre-wrap">{enquiry.notes}</span></Field></div>
          </dl>
        </section>

        <section className="mt-4 rounded-lg border border-gray-200 p-4 dark:border-gray-800">
          <h3 className="mb-3 text-sm font-semibold text-gray-900 dark:text-white">Call</h3>
          {enquiry.call ? (
            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="When">{formatCallTime(enquiry.call.startAt, enquiry.call.timezone)}</Field>
              <Field label="With">{enquiry.call.host ? `${enquiry.call.host.name}, ${enquiry.call.host.title}` : "No host set"}</Field>
              <Field label="Status">
                <span className={callIsLive(enquiry.call.status) ? "" : "text-amber-700"}>{callStatusLabel(enquiry.call.status)}</span>
              </Field>
              <Field label="Booking Reference">{enquiry.call.referenceNumber}</Field>
              {enquiry.call.zoomLink && (
                <div className="sm:col-span-2">
                  <Field label="Meeting Link">
                    <a href={enquiry.call.zoomLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline">
                      Join the call <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </Field>
                </div>
              )}
            </dl>
          ) : (
            <p className="m-0 text-sm text-gray-500">No call booked yet. A call shows here once this person books one with the same email address.</p>
          )}
        </section>

        <EnquiryCreditsPanel key={enquiry.id} enquiry={enquiry} />

        <EnquiryDealPanel enquiryId={enquiry.id} />

        <section className="mt-4 rounded-lg border border-gray-200 p-4 dark:border-gray-800">
          <h3 className="mb-3 text-sm font-semibold text-gray-900 dark:text-white">Follow-up</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="text-sm">
              <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-gray-500">Status</span>
              <select
                value={status}
                onChange={(event) => setStatus(event.target.value as EnquiryStatus)}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              >
                {ENQUIRY_STATUSES.map((value) => (
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
              <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-gray-500">Internal notes (never shown to the visitor)</span>
              <textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                maxLength={4000}
                rows={4}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
            </label>
          </div>
          {enquiry.reviewedAt && <p className="mt-3 text-xs text-gray-500">First picked up {formatDateTime(enquiry.reviewedAt)}</p>}
          <button
            onClick={save}
            disabled={!dirty || update.isPending}
            className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {update.isPending ? "Saving…" : "Save changes"}
          </button>
        </section>

        <section className="mt-4 rounded-lg border border-gray-200 p-4 dark:border-gray-800">
          <h3 className="mb-3 text-sm font-semibold text-gray-900 dark:text-white">Emails</h3>
          <div className="space-y-2">
            <Sent at={enquiry.teamNotifiedAt} label="Team Notification" />
            <Sent at={enquiry.acknowledgedAt} label="Confirmation to the Visitor" />
          </div>
          {enquiry.notifyError && (
            <p className="mt-3 rounded-md bg-red-50 p-2 text-xs text-red-700 dark:bg-red-900/20 dark:text-red-300">
              Email problem: {enquiry.notifyError}
            </p>
          )}
        </section>

        <span className={`mt-4 inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[enquiry.status]}`}>
          Currently {STATUS_LABELS[enquiry.status]}
        </span>
      </aside>
    </div>
  );
}
