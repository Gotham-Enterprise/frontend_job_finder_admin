"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, ChevronDown, ExternalLink, Info, Loader2, MapPin, Search, Send } from "lucide-react";
import ConfirmationDialog from "@/components/ui/ConfirmationDialog";
import {
  searchPlaces,
  type ManagedCampaignDetail,
  type ManagedForm,
  type ZipSuggestion,
} from "@/services/api/campaignManaged";
import {
  useAudienceOccupations,
  useManagedAudienceEstimate,
  useManagedCampaign,
  useSaveManagedPreparation,
  useSmsCost,
  useSubmitManagedCampaign,
} from "@/services/hooks/useCampaignManaged";
import { showToast } from "@/services/utils/toast";
import { CHANNEL_LABELS, STATUS_LABELS, STATUS_STYLES, formatDateTime } from "./labels";

const RADIUS_OPTIONS = ["10", "25", "50", "100"];
const TIMEZONES = [
  "Eastern Time (EDT / EST)",
  "Central Time (CDT / CST)",
  "Mountain Time (MDT / MST)",
  "Pacific Time (PDT / PST)",
  "Alaska Time (AKDT / AKST)",
  "Hawaii Time (HST)",
];
// How long a message may be (characters typed). Mirrors the backend limits.
const SMS_BODY_MAX = 320;
const EMAIL_BODY_MAX = 3000;

const VARIABLES = ["{{first_name}}", "{{specialty}}", "{{location}}", "{{facility_name}}", "{{pay_rate}}", "{{apply_link}}"];

const DEFAULT_EMAIL_BODY = `Hi {{first_name}},

{{facility_name}} is hiring {{specialty}} professionals in {{location}}, and your background looks like a strong fit.

Take a look at the role and apply here:`;

const inputClass =
  "w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white";

// The campaign as it starts out: the employer's brief fills in what it can.
const withDefaults = (campaign: ManagedCampaignDetail): ManagedForm => {
  const saved = campaign.form ?? {};
  const brief = campaign.brief;
  return {
    specialties: saved.specialties ?? [],
    location: saved.location ?? "",
    radius: saved.radius ?? "",
    locationLatitude: saved.locationLatitude ?? null,
    locationLongitude: saved.locationLongitude ?? null,
    sendType: saved.sendType ?? "ASAP",
    sendDate: saved.sendDate ?? "",
    sendTime: saved.sendTime ?? "09:00",
    timezone: saved.timezone ?? TIMEZONES[0],
    deliveryWindow: saved.deliveryWindow ?? "BUSINESS_HOURS",
    avoidWeekends: saved.avoidWeekends ?? true,
    avoidHolidays: saved.avoidHolidays ?? true,
    respectQuietHours: saved.respectQuietHours ?? true,
    subjectLine: saved.subjectLine ?? (brief ? `${brief.jobTitle} opportunity in ${brief.cityState}` : ""),
    emailBody: saved.emailBody ?? DEFAULT_EMAIL_BODY,
    ctaButtonText: saved.ctaButtonText ?? "View the role",
    ctaTargetUrl: saved.ctaTargetUrl ?? brief?.jobLink ?? "",
    payRate: saved.payRate ?? "",
    facilityName: saved.facilityName ?? campaign.companyName ?? "",
    specialtyName: saved.specialtyName ?? "",
    locationText: saved.locationText ?? brief?.cityState ?? "",
    smsBody:
      saved.smsBody ??
      (brief ? `Hi {{first_name}}, ${brief.jobTitle} opening in ${brief.cityState}. Details: ${brief.jobLink}` : ""),
    preventFatigue: saved.preventFatigue ?? true,
    excludeOptOuts: saved.excludeOptOuts ?? true,
  };
};

const Section: React.FC<{ title: string; hint?: string; children: React.ReactNode }> = ({ title, hint, children }) => (
  <section className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
    <h2 className="text-base font-semibold text-gray-900 dark:text-white">{title}</h2>
    {hint && <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{hint}</p>}
    <div className="mt-4 space-y-4">{children}</div>
  </section>
);

const Field: React.FC<{ label: string; hint?: string; children: React.ReactNode }> = ({ label, hint, children }) => (
  <label className="block">
    <span className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
    {children}
    {hint && <span className="mt-1 block text-xs text-gray-500 dark:text-gray-400">{hint}</span>}
  </label>
);

const Check_: React.FC<{ checked: boolean; onChange: (value: boolean) => void; label: string; disabled?: boolean }> = ({ checked, onChange, label, disabled }) => (
  <label className={`flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 ${disabled ? "opacity-60" : "cursor-pointer"}`}>
    <input type="checkbox" checked={checked} disabled={disabled} onChange={(event) => onChange(event.target.checked)} className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
    {label}
  </label>
);

export default function PrepareCampaign({ id }: { id: string }) {
  const { data: campaign, isLoading, isError, refetch } = useManagedCampaign(id);
  const { data: occupations } = useAudienceOccupations();
  const save = useSaveManagedPreparation(id);
  const submit = useSubmitManagedCampaign(id);

  const [form, setForm] = useState<ManagedForm | null>(null);
  const [dirty, setDirty] = useState(false);
  const [occupationSearch, setOccupationSearch] = useState("");
  const [confirming, setConfirming] = useState(false);

  // Start the form from the saved preparation once, then from the server again after each save.
  useEffect(() => {
    if (campaign && (form === null || !dirty)) setForm(withDefaults(campaign));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campaign]);

  const update = (changes: Partial<ManagedForm>) => {
    setForm((current) => (current ? { ...current, ...changes } : current));
    setDirty(true);
    if (submit.isError) submit.reset(); // the content changed: the old "flagged" notice no longer applies
  };

  const radiusMiles = parseInt(form?.radius ?? "", 10) || 0;
  const estimateBody = useMemo(
    () => ({
      occupationIds: form?.specialties ?? [],
      ...(form && radiusMiles > 0 && form.locationLatitude != null && form.locationLongitude != null
        ? { location: { latitude: form.locationLatitude, longitude: form.locationLongitude, radiusMiles } }
        : {}),
    }),
    [form?.specialties, form?.locationLatitude, form?.locationLongitude, radiusMiles], // eslint-disable-line react-hooks/exhaustive-deps
  );
  const { data: estimate, isFetching: estimating } = useManagedAudienceEstimate(estimateBody);
  const { data: smsCost } = useSmsCost(form?.smsBody ?? "", Boolean(campaign?.channels.includes("SMS")), { ctaTargetUrl: form?.ctaTargetUrl, location: form?.location, payRate: form?.payRate, facilityName: form?.facilityName, specialtyName: form?.specialtyName, locationText: form?.locationText });

  const filteredOccupations = useMemo(() => {
    const term = occupationSearch.trim().toLowerCase();
    return (occupations ?? []).filter((o) => !term || o.name.toLowerCase().includes(term));
  }, [occupations, occupationSearch]);

  if (isLoading || !form) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-primary" />
      </div>
    );
  }
  if (isError || !campaign) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center text-sm text-red-700">
        We couldn’t load this campaign.{" "}
        <button onClick={() => refetch()} className="font-semibold underline">Try Again</button>
      </div>
    );
  }

  const hasEmail = campaign.channels.includes("EMAIL");
  const hasSms = campaign.channels.includes("SMS");
  const editable = campaign.editable;
  const brief = campaign.brief;

  const toggle = (list: string[], value: string) => (list.includes(value) ? list.filter((item) => item !== value) : [...list, value]);

  const saveNow = async () => {
    await save.mutateAsync(form);
    setDirty(false);
  };
  const handleSave = async () => {
    try {
      await saveNow();
      showToast.success("Saved", "Your preparation has been saved.");
    } catch {
      /* the hook already showed the error */
    }
  };
  const handleSubmit = async () => {
    setConfirming(false);
    try {
      await saveNow();
      await submit.mutateAsync();
    } catch {
      /* the hooks already showed the error */
    }
  };

  const busy = save.isPending || submit.isPending;
  // Already with the employer and unchanged: nothing to submit. A saved change takes it back to preparation.
  const canSubmit = campaign.status === "PENDING_WITH_GOTHAM" || dirty;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link href="/admin/campaigns/managed" className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
          <ArrowLeft className="h-4 w-4" /> Back to Managed Campaigns
        </Link>
        <div className="mt-3 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{brief?.jobTitle ?? campaign.name}</h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              {campaign.companyName}
              {campaign.requestedBy && ` · ${campaign.requestedBy.name} (${campaign.requestedBy.email})`}
              {" · "}
              {campaign.channels.map((channel) => CHANNEL_LABELS[channel]).join(" + ")} campaign
            </p>
          </div>
          <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${STATUS_STYLES[campaign.status]}`}>{STATUS_LABELS[campaign.status]}</span>
        </div>
      </div>

      {campaign.status === "READY_FOR_APPROVAL" && (
        <div className="flex items-start gap-3 rounded-lg border border-indigo-200 bg-indigo-50 p-4 text-sm text-indigo-900 dark:border-indigo-900/50 dark:bg-indigo-900/10 dark:text-indigo-200">
          <Info className="mt-0.5 h-4 w-4 shrink-0" />
          <p className="m-0">
            Sent to the employer{campaign.prepared?.preparedAt ? ` on ${formatDateTime(campaign.prepared.preparedAt)}` : ""}. They can approve it now. If you save a change, it goes back to
            “To prepare” and you will need to submit it again.
          </p>
        </div>
      )}
      {!editable && (
        <div className="flex items-start gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700 dark:border-gray-800 dark:bg-gray-900/40 dark:text-gray-300">
          <Info className="mt-0.5 h-4 w-4 shrink-0" />
          <p className="m-0">
            {campaign.status === "AWAITING_DETAILS"
              ? "The employer has not sent their campaign details yet. You can prepare it once they do."
              : "This campaign has been approved and launched, so it can no longer be edited."}
          </p>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,320px)_minmax(0,1fr)]">
        {/* The employer's request */}
        <aside className="space-y-4 lg:sticky lg:top-4 lg:self-start">
          <section className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">Employer’s Request</h2>
            {brief ? (
              <dl className="mt-4 space-y-3 text-sm">
                {[
                  ["Job Title", brief.jobTitle],
                  ["Location", brief.cityState],
                  ["Audience", brief.audienceRole],
                  ["Results Forwarding", brief.forwardResults ? brief.forwardEmail || "Requested" : "Not Requested"],
                ].map(([label, value]) => (
                  <div key={label}>
                    <dt className="text-xs uppercase tracking-wide text-gray-500">{label}</dt>
                    <dd className="mt-0.5 font-medium text-gray-900 dark:text-white">{value}</dd>
                  </div>
                ))}
                <div>
                  <dt className="text-xs uppercase tracking-wide text-gray-500">Job Link</dt>
                  <dd className="mt-0.5 break-all">
                    <a href={brief.jobLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-medium text-primary hover:underline">
                      {brief.jobLink} <ExternalLink className="h-3 w-3 shrink-0" />
                    </a>
                  </dd>
                </div>
              </dl>
            ) : (
              <p className="mt-3 text-sm text-gray-500">No details yet.</p>
            )}
          </section>

          <section className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">Reach</h2>
            {form.specialties.length === 0 ? (
              <p className="mt-3 text-sm text-gray-500">Choose at least one occupation to see how many candidates this reaches.</p>
            ) : (
              <div className="mt-3 space-y-2 text-sm">
                <p className="m-0 flex items-center gap-2 text-2xl font-bold text-gray-900 dark:text-white">
                  {estimate ? (hasEmail && !hasSms ? estimate.byChannel.email : hasSms && !hasEmail ? estimate.byChannel.sms : estimate.count).toLocaleString("en-US") : "–"}
                  {estimating && <Loader2 className="h-4 w-4 animate-spin text-gray-400" />}
                </p>
                <p className="m-0 text-gray-500">candidates match</p>
                {estimate && (
                  <ul className="m-0 list-none space-y-1 p-0 text-gray-700 dark:text-gray-300">
                    {hasEmail && <li>{estimate.deliverable.email.toLocaleString("en-US")} emails will be sent (opted in)</li>}
                    {hasSms && <li>{estimate.deliverable.sms.toLocaleString("en-US")} texts will be sent (opted in)</li>}
                  </ul>
                )}
                <p className="m-0 border-t border-gray-100 pt-2 text-gray-700 dark:border-gray-800 dark:text-gray-300">
                  Employer’s credits:{" "}
                  {campaign.creditsAvailable
                    ? [
                        hasEmail && `Email ${campaign.creditsAvailable.EMAIL.toLocaleString("en-US")}`,
                        hasSms && `Text ${campaign.creditsAvailable.SMS.toLocaleString("en-US")}`,
                      ]
                        .filter(Boolean)
                        .join(" · ")
                    : "–"}
                  {estimate && campaign.creditsAvailable && (() => {
                    // Email and text are separate balances: say which one is short. An email uses one credit; a text uses one per
                    // message segment (usually two or three), so a text is checked by credits, not by how many people get one.
                    const textCredits = estimate.deliverable.sms * (smsCost?.segments ?? 1);
                    const short = [
                      hasEmail && estimate.deliverable.email > campaign.creditsAvailable.EMAIL && "email",
                      hasSms && textCredits > campaign.creditsAvailable.SMS && "text",
                    ].filter(Boolean);
                    return (
                      <>
                        {hasSms && smsCost && (
                          <span className="mt-1 block text-xs text-gray-500">
                            Texts need about {textCredits.toLocaleString("en-US")} credits ({estimate.deliverable.sms.toLocaleString("en-US")} texts × {smsCost.segments} each).
                          </span>
                        )}
                        {short.length > 0 && (
                          <span className="mt-1 block text-xs text-amber-700 dark:text-amber-400">
                            The employer does not have enough {short.join(" or ")} credits to approve this. They will be asked to contact sales.
                          </span>
                        )}
                      </>
                    );
                  })()}
                </p>
              </div>
            )}
          </section>
        </aside>

        {/* Preparation */}
        <fieldset disabled={!editable || busy} className="m-0 min-w-0 space-y-6 border-0 p-0">
          <Section title="1. Audience" hint="Who should receive this campaign.">
            <Field label="Occupations">
              <div className="relative mb-2">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input value={occupationSearch} onChange={(event) => setOccupationSearch(event.target.value)} placeholder="Search occupations" className={`${inputClass} pl-9`} />
              </div>
              <div className="max-h-56 space-y-1 overflow-y-auto rounded-lg border border-gray-200 p-2 dark:border-gray-700">
                {!occupations ? (
                  <p className="p-2 text-sm text-gray-500">Loading occupations…</p>
                ) : filteredOccupations.length === 0 ? (
                  <p className="p-2 text-sm text-gray-500">No occupations match.</p>
                ) : (
                  filteredOccupations.map((occupation) => (
                    <label key={occupation.id} className="flex cursor-pointer items-center justify-between gap-3 rounded px-2 py-1.5 text-sm hover:bg-gray-50 dark:hover:bg-gray-800">
                      <span className="flex items-center gap-2 text-gray-800 dark:text-gray-200">
                        <input
                          type="checkbox"
                          checked={form.specialties.includes(occupation.id)}
                          onChange={() => update({ specialties: toggle(form.specialties, occupation.id) })}
                          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        {occupation.name}
                      </span>
                      <span className="text-xs text-gray-500">{occupation.count.toLocaleString("en-US")}</span>
                    </label>
                  ))
                )}
              </div>
              {form.specialties.length > 0 && <p className="mt-1.5 text-xs text-gray-500">{form.specialties.length} selected</p>}
            </Field>

            {/* The employer said where they want to hire, but the audience only follows a place (and radius) picked below. */}
            {brief?.cityState && !(form.locationLatitude != null && radiusMiles > 0) && (
              <p role="status" className="m-0 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:border-amber-900/50 dark:bg-amber-900/20 dark:text-amber-200">
                The employer asked for <b>{brief.cityState}</b>, but no location and radius is set below, so this goes to everyone matching the occupations, wherever they are. Pick a place and a radius to limit it.
              </p>
            )}

            <LocationPicker
              location={form.location}
              hasPoint={form.locationLatitude != null}
              initialQuery={brief?.cityState ?? ""}
              radius={form.radius}
              onPick={(place) => update({ location: place.description, locationLatitude: place.latitude ?? null, locationLongitude: place.longitude ?? null })}
              onClear={() => update({ location: "", locationLatitude: null, locationLongitude: null, radius: "" })}
              onRadius={(value) => update({ radius: value })}
              disabled={!editable || busy}
            />
          </Section>

          <Section title="2. Message" hint="What candidates will receive. Personalize with the variables below.">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Job Link *" hint="Where candidates go to see the job and apply. Clicks are tracked. Use it in the message with {{apply_link}}.">
                <input value={form.ctaTargetUrl} onChange={(event) => update({ ctaTargetUrl: event.target.value })} placeholder="https://" className={inputClass} />
              </Field>
              <Field label="Pay Rate (Optional)" hint="Only used where the message has {{pay_rate}}.">
                <input value={form.payRate} onChange={(event) => update({ payRate: event.target.value })} maxLength={60} placeholder="$65/hr + $10k sign-on bonus" className={inputClass} />
              </Field>
              <Field label="Facility or Company Name *" hint="Fills {{facility_name}}. Starts as the employer’s company name.">
                <input value={form.facilityName} onChange={(event) => update({ facilityName: event.target.value })} maxLength={120} className={inputClass} />
              </Field>
              <Field label="Job Location *" hint="Where the job is; fills {{location}}. Starts as the location the employer asked for.">
                <input value={form.locationText} onChange={(event) => update({ locationText: event.target.value })} maxLength={120} placeholder="Austin, TX" className={inputClass} />
              </Field>
              <Field label="Role or Specialty (Optional)" hint="Fills {{specialty}}. Leave empty and each candidate sees their own specialty.">
                <input value={form.specialtyName} onChange={(event) => update({ specialtyName: event.target.value })} maxLength={120} placeholder="Registered Nurse" className={inputClass} />
              </Field>
            </div>
            <p className="m-0 flex flex-wrap items-center gap-2 text-xs text-gray-500">
              Variables:
              {VARIABLES.map((variable) => (
                <code key={variable} className="rounded bg-gray-100 px-1.5 py-0.5 text-gray-700 dark:bg-gray-800 dark:text-gray-300">{variable}</code>
              ))}
            </p>
            {hasEmail && (
              <>
                <Field label="Email Subject">
                  <input value={form.subjectLine} onChange={(event) => update({ subjectLine: event.target.value })} maxLength={150} className={inputClass} />
                </Field>
                <Field label="Email Body" hint={`${form.emailBody.length.toLocaleString("en-US")} / ${EMAIL_BODY_MAX.toLocaleString("en-US")} characters`}>
                  <textarea value={form.emailBody} onChange={(event) => update({ emailBody: event.target.value })} rows={9} maxLength={EMAIL_BODY_MAX} className={inputClass} />
                </Field>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Button Text" hint="The button goes to the job link above.">
                    <input value={form.ctaButtonText} onChange={(event) => update({ ctaButtonText: event.target.value })} maxLength={60} className={inputClass} />
                  </Field>
                </div>
              </>
            )}
            {hasSms && (
              <Field
                label="Text Message"
                hint={
                  smsCost && form.smsBody.trim()
                    ? `${form.smsBody.length} / ${SMS_BODY_MAX} characters typed. ${smsCost.characters} characters once sent, counting the tracking link and “Reply STOP to opt out.” (added automatically); each text uses up to ${smsCost.segments} credit${smsCost.segments === 1 ? "" : "s"}${smsCost.encoding === "UCS-2" ? " (special characters such as emoji or curly quotes make texts shorter and cost more)" : ""}.${smsCost.tooLong ? " Too long: texts over 1,600 characters cannot be sent." : ""}`
                      : `${form.smsBody.length} / ${SMS_BODY_MAX} characters typed. The tracking link and “Reply STOP to opt out.” are added automatically.`
                }
              >
                <textarea value={form.smsBody} onChange={(event) => update({ smsBody: event.target.value })} rows={4} maxLength={SMS_BODY_MAX} className={inputClass} />
              </Field>
            )}
          </Section>

          <Section title="3. Delivery" hint="The employer chooses this, not Gotham.">
            <p className="m-0 text-sm text-gray-600 dark:text-gray-300">
              When the campaign goes out is the employer&apos;s choice. When they approve it, they pick &ldquo;send right now&rdquo; or a date and time,
              and whether to skip weekends, US holidays and night hours. You do not need to set anything here.
            </p>
            <div className="flex flex-wrap gap-x-6 gap-y-2">
              <Check_ label="Skip People Contacted Recently" checked={form.preventFatigue} onChange={(value) => update({ preventFatigue: value })} />
            </div>
          </Section>

          {submit.isError && /^Flagged during content review/.test(submit.error?.message ?? "") && (
            <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
              <p className="m-0 font-semibold">This content was flagged and was not sent for approval</p>
              <p className="m-0 mt-1">{submit.error?.message}</p>
              <p className="m-0 mt-1 text-xs">Change the wording above and submit again. The content-review team has been notified; see Flagged Content to review it.</p>
            </div>
          )}
          {editable && (
            <div className="flex flex-wrap items-center justify-end gap-3">
              {dirty && <span className="text-sm text-gray-500">Unsaved Changes</span>}
              <button type="button" onClick={handleSave} disabled={busy || !dirty} className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200">
                {save.isPending ? "Saving…" : "Save"}
              </button>
              {canSubmit ? (
                <button type="button" onClick={() => setConfirming(true)} disabled={busy} className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50">
                  <Send className="h-4 w-4" />
                  {submit.isPending ? "Submitting…" : "Submit for Employer Approval"}
                </button>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-700 dark:text-indigo-300">
                  <Check className="h-4 w-4" /> With the Employer for Approval
                </span>
              )}
            </div>
          )}
        </fieldset>
      </div>

      <ConfirmationDialog
        isOpen={confirming}
        onClose={() => setConfirming(false)}
        onCancel={() => setConfirming(false)}
        onConfirm={handleSubmit}
        title="Send to the Employer for Approval?"
        message="Your preparation is saved and the employer can review and approve it. Nothing is sent to candidates until they approve."
        confirmText="Submit"
      />
    </div>
  );
}

// Finds the place the audience is centred on (ZIP or city) and a radius around it. Without a radius, no location filter applies.
function LocationPicker({
  location,
  hasPoint,
  initialQuery,
  radius,
  onPick,
  onClear,
  onRadius,
  disabled,
}: {
  location: string;
  hasPoint: boolean;
  initialQuery: string;
  radius: string;
  onPick: (place: ZipSuggestion) => void;
  onClear: () => void;
  onRadius: (value: string) => void;
  disabled?: boolean;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ZipSuggestion[]>([]);
  const [searching, setSearching] = useState(false);
  const request = useRef(0);

  useEffect(() => {
    const term = query.trim();
    if (term.length < 2) {
      setResults([]);
      return;
    }
    const id = ++request.current;
    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const found = await searchPlaces(term);
        if (id === request.current) setResults(found.filter((place) => place.latitude != null && place.longitude != null).slice(0, 8));
      } catch {
        if (id === request.current) setResults([]);
      } finally {
        if (id === request.current) setSearching(false);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div>
      <span className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Location (Optional)</span>
      {location && hasPoint ? (
        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-gray-100 px-3 py-2 text-sm text-gray-800 dark:bg-gray-800 dark:text-gray-200">
            <MapPin className="h-4 w-4 text-primary" /> {location}
          </span>
          <div className="relative">
            <select value={radius} onChange={(event) => onRadius(event.target.value)} disabled={disabled} className="min-w-[190px] cursor-pointer appearance-none rounded-lg border border-gray-200 bg-white py-2 pl-3 pr-10 text-sm disabled:cursor-not-allowed dark:border-gray-700 dark:bg-gray-800 dark:text-white">
              <option value="">No Radius (everywhere)</option>
              {RADIUS_OPTIONS.map((miles) => <option key={miles} value={miles}>within {miles} miles</option>)}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
          </div>
          <button type="button" onClick={onClear} disabled={disabled} className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400">Change</button>
        </div>
      ) : (
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={initialQuery ? `Search a ZIP or city, e.g. ${initialQuery}` : "Search a ZIP code or city"} className={`${inputClass} pl-9`} />
          {(searching || results.length > 0) && (
            <ul className="absolute z-10 mt-1 max-h-60 w-full list-none overflow-y-auto rounded-lg border border-gray-200 bg-white p-1 shadow-lg dark:border-gray-700 dark:bg-gray-800">
              {searching && results.length === 0 && <li className="px-3 py-2 text-sm text-gray-500">Searching…</li>}
              {results.map((place) => (
                <li key={`${place.zipCode}-${place.description}`}>
                  <button
                    type="button"
                    onClick={() => {
                      onPick(place);
                      setQuery("");
                      setResults([]);
                      if (!radius) onRadius("25");
                    }}
                    className="flex w-full items-center justify-between rounded px-3 py-2 text-left text-sm text-gray-800 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-700"
                  >
                    {place.description}
                    <Check className="h-3.5 w-3.5 opacity-0" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
      <p className="mt-1 text-xs text-gray-500">Pick a place to limit the audience to people within a radius. Skip it to include everyone matching the occupations.</p>
    </div>
  );
}
