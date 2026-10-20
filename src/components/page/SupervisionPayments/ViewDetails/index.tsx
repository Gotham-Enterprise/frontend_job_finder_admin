"use client";
import React, { useMemo, useState } from "react";
import { AlertTriangle, RotateCw } from "lucide-react";
import {
  useAddLateEntry,
  useApproveLateEntryRequest,
  useBillingWeek,
  useDismissLateEntryRequest,
  useResolveDispute,
  useRetryLateEntryCharge,
} from "@/services/hooks/useSupervisionPayments";
import {
  BillingWeek,
  BillingWeekSession,
  DisputeAttachment,
  LateEntryRequest,
} from "@/services/types/supervisionPayments";
import {
  PREPAY_STATUS_CLASS,
  PREPAY_STATUS_LABEL,
  WEEK_STATUS_CLASS,
  WEEK_STATUS_LABEL,
  formatCalendarDate,
  formatCents,
  formatEasternDateTime,
  formatMinutes,
  formatWeekRange,
} from "@/services/utils/supervisionPaymentsFormat";
import ErrorState from "../../../common/ErrorState";
import FullScreenSpinner from "../../../ui/FullScreenSpinner";
import BackToListButton from "@/components/ui/BackToListButton";
import ConfirmationDialog from "@/components/ui/ConfirmationDialog";
import Input from "@/components/ui/input/Input";
import Select from "@/components/form/Select";

const UNIT = 15;
const BACK = "/admin/supervision-payments";

const textareaClass =
  "w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90";

const buttonClass =
  "inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed";

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
          {title}
        </h3>
      </div>
      <div className="px-6 py-4">{children}</div>
    </div>
  );
}

function FieldRow({
  label,
  value,
  compact = false,
}: {
  label: string;
  value: React.ReactNode;
  /** Narrow label column, for the side card */
  compact?: boolean;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-1 py-2 border-b border-gray-50 dark:border-gray-700/50 last:border-0">
      <span
        className={`text-sm font-medium text-gray-500 dark:text-gray-400 flex-shrink-0 ${compact ? "sm:w-28" : "sm:w-44"}`}
      >
        {label}
      </span>
      <span className="text-sm text-gray-900 dark:text-white flex-1 min-w-0 break-words">
        {value ?? <span className="text-gray-400 italic">—</span>}
      </span>
    </div>
  );
}

/** Today's US Eastern date, YYYY-MM-DD (billing runs on Eastern time). */
const todayEastern = () =>
  new Intl.DateTimeFormat("en-CA", { timeZone: "America/New_York" }).format(new Date());

const durationOptions = (maxMinutes: number, includeZero: boolean) =>
  Array.from({ length: Math.floor(maxMinutes / UNIT) + (includeZero ? 1 : 0) }, (_, i) => {
    const minutes = (includeZero ? i : i + 1) * UNIT;
    return {
      value: String(minutes),
      label: minutes === 0 ? "0 min (refund everything)" : formatMinutes(minutes),
    };
  });

/** What the supervisor gets and what's refunded for a given number of paid minutes. */
function settlementPreview(week: BillingWeek, minutes: number) {
  const earned = Math.min(
    Math.round((week.terms.hourlyRateCents * minutes) / 60),
    week.prepayAmountCents,
  );
  const fee = Math.round((earned * week.terms.platformFeeBps) / 10000);
  return { payout: earned - fee, fee, refund: week.prepayAmountCents - earned };
}

/** The supervisee's evidence images; each opens full size in a new tab. */
function DisputeEvidence({ attachments }: { attachments: DisputeAttachment[] }) {
  if (attachments.length === 0) return null;
  return (
    <div className="mt-3">
      <p className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
        Evidence ({attachments.length})
      </p>
      <div className="mt-1.5 flex flex-wrap gap-2">
        {attachments.map((a) => (
          <a
            key={a.id}
            href={a.url}
            target="_blank"
            rel="noopener noreferrer"
            title={`${a.fileName} · ${(a.sizeBytes / 1024 / 1024).toFixed(1)} MB`}
            className="block rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
          >
            { }
            <img src={a.url} alt={a.fileName} className="h-24 w-24 object-cover" />
          </a>
        ))}
      </div>
    </div>
  );
}

function ResolveDisputeCard({ week }: { week: BillingWeek }) {
  const resolve = useResolveDispute(week.id);
  const maxMinutes = Math.min(week.loggedMinutes, week.terms.weeklyCapMinutes);
  const [minutes, setMinutes] = useState(String(maxMinutes));
  const [note, setNote] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const preview = settlementPreview(week, Number(minutes));
  const paid = week.prepayStatus === "PAID";

  return (
    <SectionCard title="Dispute">
      <div className="rounded-lg bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm text-red-800 dark:text-red-300">
        <p className="font-medium">
          Disputed by {week.hire.supervisee.fullName || "the supervisee"} on{" "}
          {formatEasternDateTime(week.disputedAt)}
        </p>
        <p className="mt-1 whitespace-pre-wrap">{week.disputeReason}</p>
        <DisputeEvidence attachments={week.disputeAttachments} />
      </div>
      <div className="mt-4 space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Hours to pay the supervisor ({formatMinutes(week.loggedMinutes)} logged)
          </label>
          <Select value={minutes} onChange={setMinutes} options={durationOptions(maxMinutes, true)} />
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {paid
            ? `Supervisor receives ${formatCents(preview.payout)} (after a ${formatCents(preview.fee)} platform fee); ${formatCents(preview.refund)} is refunded to the supervisee.`
            : `The prepay isn't paid yet: ${Number(minutes) === 0 ? "the week closes at $0 and the charge is cancelled." : "the supervisor is paid once the supervisee pays the week."}`}
        </p>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Resolution note (internal, kept for the record)
          </label>
          <textarea
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g. Confirmed with both by phone: one session of 1 hour."
            className={textareaClass}
          />
        </div>
        <div className="flex justify-end">
          <button
            onClick={() => setConfirmOpen(true)}
            disabled={note.trim().length < 5 || resolve.isPending}
            className={`${buttonClass} bg-brand-500 text-white hover:bg-brand-600`}
          >
            Resolve dispute
          </button>
        </div>
      </div>
      <ConfirmationDialog
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={async () => {
          await resolve.mutateAsync({ approvedMinutes: Number(minutes), note: note.trim() });
          setConfirmOpen(false);
        }}
        title="Resolve dispute"
        message={
          Number(minutes) === 0
            ? "Pay the supervisor nothing and refund the whole prepay? This can't be undone."
            : `Pay the supervisor for ${formatMinutes(Number(minutes))} and refund the rest? This can't be undone.`
        }
        confirmText="Resolve"
        cancelText="Cancel"
        isLoading={resolve.isPending}
      />
    </SectionCard>
  );
}

function LateEntryStatus({ session }: { session: BillingWeekSession }) {
  if (session.source !== "SUPPORT") return null;
  const approval =
    session.approvalStatus === "PENDING"
      ? "Waiting for supervisee approval"
      : session.approvalStatus === "APPROVED"
        ? "Approved by supervisee"
        : "Rejected by supervisee";
  return (
    <div className="mt-1 text-xs text-gray-500 dark:text-gray-400 space-y-0.5">
      <p>
        <span className="font-medium text-amber-700 dark:text-amber-400">Late entry</span> · {approval}
      </p>
      {session.supportNote && <p>Support note: {session.supportNote}</p>}
      {session.chargeStatus && (
        <p className={PREPAY_STATUS_CLASS[session.chargeStatus]}>
          Separate charge {formatCents(session.totalCents)}: {PREPAY_STATUS_LABEL[session.chargeStatus]}
          {session.chargeStatus === "PAID" &&
            ` · supervisor paid ${formatCents(session.supervisorAmountCents)}`}
          {session.failureMessage && session.chargeStatus === "FAILED" && ` (${session.failureMessage})`}
        </p>
      )}
    </div>
  );
}

function SessionsCard({ week }: { week: BillingWeek }) {
  const retry = useRetryLateEntryCharge(week.id);
  return (
    <SectionCard title={`Sessions (${formatMinutes(week.loggedMinutes)} of ${formatMinutes(week.terms.weeklyCapMinutes)})`}>
      {week.sessions.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">No sessions logged.</p>
      ) : (
        <ul className="divide-y divide-gray-100 dark:divide-gray-700">
          {week.sessions.map((session) => (
            <li key={session.id} className="py-3 flex gap-4">
              <div className="w-28 shrink-0">
                <p className="text-sm text-gray-900 dark:text-white">
                  {formatCalendarDate(session.sessionDate)}
                </p>
                <p
                  className={`text-xs ${session.approvalStatus === "REJECTED" ? "line-through text-gray-400" : "text-gray-500 dark:text-gray-400"}`}
                >
                  {formatMinutes(session.durationMinutes)}
                </p>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-words">
                  {session.notes}
                </p>
                <LateEntryStatus session={session} />
              </div>
              {session.chargeStatus === "FAILED" && (
                <button
                  onClick={() => retry.mutate(session.id)}
                  disabled={retry.isPending}
                  className={`${buttonClass} self-start border border-gray-200 text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300`}
                >
                  <RotateCw className="h-4 w-4" />
                  {retry.isPending ? "Retrying..." : "Retry charge"}
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </SectionCard>
  );
}

/** The supervisor's open requests for this week: add each as a late session, or decline it. */
function LateEntryRequestsList({ week, canAdd }: { week: BillingWeek; canAdd: boolean }) {
  const approve = useApproveLateEntryRequest(week.id);
  const decline = useDismissLateEntryRequest(week.id);
  const [declining, setDeclining] = useState<LateEntryRequest | null>(null);
  const [note, setNote] = useState("");
  const requests = week.lateEntryRequests.filter((r) => r.status === "REQUESTED");
  if (requests.length === 0) return null;
  const busy = approve.isPending || decline.isPending;
  const left = week.terms.weeklyCapMinutes - week.loggedMinutes;

  const confirmDecline = async () => {
    if (!declining) return;
    await decline.mutateAsync({ requestId: declining.id, note: note.trim() || undefined });
    setDeclining(null);
    setNote("");
  };

  return (
    <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-900/50 dark:bg-amber-900/20 p-4">
      <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
        Requested by the supervisor ({requests.length})
      </p>
      <p className="mt-1 text-xs text-amber-800/80 dark:text-amber-300/80">
        Approving adds the session as requested; the supervisee is then asked to approve it.
      </p>
      <ul className="mt-1 divide-y divide-amber-200 dark:divide-amber-900/50">
        {requests.map((request) => {
          const overCap = request.durationMinutes > left;
          return (
            <li key={request.id} className="py-3">
              <div className="flex flex-wrap gap-4 items-start">
                <div className="w-28 shrink-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {formatCalendarDate(request.sessionDate)}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{formatMinutes(request.durationMinutes)}</p>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-words">
                    {request.notes}
                  </p>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Requested {formatEasternDateTime(request.createdAt)}
                    {canAdd && overCap && ` · over the weekly max (${formatMinutes(left)} left)`}
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <button
                    type="button"
                    onClick={() => void approve.mutateAsync({ requestId: request.id })}
                    disabled={busy || !canAdd || overCap}
                    className={`${buttonClass} px-3 py-1.5 text-xs bg-brand-500 text-white hover:bg-brand-600`}
                  >
                    {approve.isPending && approve.variables?.requestId === request.id ? "Adding..." : "Approve"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setDeclining(declining?.id === request.id ? null : request);
                      setNote("");
                    }}
                    disabled={busy}
                    className={`${buttonClass} px-3 py-1.5 text-xs border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800`}
                  >
                    Decline
                  </button>
                </div>
              </div>
              {declining?.id === request.id && (
                <div className="mt-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-3">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Reason (shown to the supervisor, optional)
                  </label>
                  <Input
                    type="text"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="e.g. No matching session in the supervisee's records"
                  />
                  <div className="mt-3 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setDeclining(null)}
                      disabled={busy}
                      className={`${buttonClass} border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300`}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => void confirmDecline()}
                      disabled={busy}
                      className={`${buttonClass} bg-red-600 text-white hover:bg-red-700`}
                    >
                      {decline.isPending ? "Declining..." : "Decline request"}
                    </button>
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function AddLateEntryCard({ week }: { week: BillingWeek }) {
  const add = useAddLateEntry(week.id);
  const today = todayEastern();
  const left = week.terms.weeklyCapMinutes - week.loggedMinutes;
  const maxDate = week.endDate < today ? week.endDate : today;
  const agreementStart = week.hire.agreement?.startDate ?? week.startDate;
  const minDate = agreementStart > week.startDate ? agreementStart : week.startDate;
  const [sessionDate, setSessionDate] = useState(maxDate);
  const [minutes, setMinutes] = useState("");
  const [notes, setNotes] = useState("");
  const [reason, setReason] = useState("");

  const canAdd = today <= week.lateEntryDeadline && left >= UNIT;
  const requestsList = <LateEntryRequestsList week={week} canAdd={canAdd} />;

  if (today > week.lateEntryDeadline) {
    return (
      <SectionCard title="Add a late session">
        {requestsList}
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Late sessions for this week could be added until {formatCalendarDate(week.lateEntryDeadline)}.
        </p>
      </SectionCard>
    );
  }
  if (left < UNIT) {
    return (
      <SectionCard title="Add a late session">
        {requestsList}
        <p className="text-sm text-gray-500 dark:text-gray-400">This week has reached its weekly max.</p>
      </SectionCard>
    );
  }

  const submit = async () => {
    await add.mutateAsync({
      sessionDate,
      durationMinutes: Number(minutes),
      notes: notes.trim(),
      reason: reason.trim() || undefined,
    });
    setMinutes("");
    setNotes("");
    setReason("");
  };

  return (
    <SectionCard title="Add a late session">
      {requestsList}
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
        For a session the supervisor missed logging and didn&apos;t request in the app (until{" "}
        {formatCalendarDate(week.lateEntryDeadline)}). The supervisee must approve it; if this week is already
        settled, it&apos;s charged separately and the supervisor is paid right away.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date</label>
          <Input
            type="date"
            value={sessionDate}
            min={minDate}
            max={maxDate}
            onChange={(e) => setSessionDate(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Duration ({formatMinutes(left)} left)
          </label>
          <Select
            value={minutes}
            onChange={setMinutes}
            options={durationOptions(left, false)}
            placeholder="Select duration"
          />
        </div>
      </div>
      <div className="mt-3">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Session notes (shown to both parties)
        </label>
        <textarea
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Topics covered, as the supervisor described them"
          className={textareaClass}
        />
      </div>
      <div className="mt-3">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Why it's late (internal)
        </label>
        <Input
          type="text"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="e.g. Supervisor emailed support on Oct 21"
        />
      </div>
      <div className="mt-4 flex justify-end">
        <button
          onClick={() => void submit()}
          disabled={!minutes || !notes.trim() || !sessionDate || add.isPending}
          className={`${buttonClass} bg-brand-500 text-white hover:bg-brand-600`}
        >
          {add.isPending ? "Adding..." : "Add late session"}
        </button>
      </div>
    </SectionCard>
  );
}

function PaymentCard({ week }: { week: BillingWeek }) {
  const approvedBy =
    week.approvedBy === "SUPERVISEE"
      ? "Supervisee"
      : week.approvedBy === "AUTO"
        ? "Automatically (review ended)"
        : week.approvedBy === "SUPPORT"
          ? "Gotham support"
          : null;
  return (
    <SectionCard title="Payment">
      <FieldRow
        compact
        label="Prepay"
        value={
          <>
            {formatCents(week.totalCents)}{" "}
            <span className="text-xs text-gray-500">
              ({formatCents(week.prepayAmountCents)} + {formatCents(week.serviceFeeCents)} service fee)
            </span>
          </>
        }
      />
      <FieldRow
        compact
        label="Prepay status"
        value={
          <span className={PREPAY_STATUS_CLASS[week.prepayStatus]}>
            {PREPAY_STATUS_LABEL[week.prepayStatus]}
            {week.paidAt && ` · ${formatEasternDateTime(week.paidAt)}`}
            {week.prepayStatus === "FAILED" && week.failureMessage && ` · ${week.failureMessage}`}
          </span>
        }
      />
      <FieldRow compact label="Approved hours" value={week.approvedMinutes != null ? formatMinutes(week.approvedMinutes) : null} />
      <FieldRow compact label="Approved by" value={approvedBy} />
      <FieldRow compact label="Supervisor paid" value={week.supervisorAmountCents != null ? formatCents(week.supervisorAmountCents) : null} />
      <FieldRow compact label="Platform fee" value={week.platformFeeCents != null ? formatCents(week.platformFeeCents) : null} />
      <FieldRow compact label="Refunded" value={week.refundCents != null ? formatCents(week.refundCents) : null} />
      <FieldRow compact label="Settled" value={week.settledAt ? formatEasternDateTime(week.settledAt) : null} />
      <FieldRow compact label="Stripe payment" value={week.stripePaymentIntentId && <code className="text-xs break-all">{week.stripePaymentIntentId}</code>} />
      <FieldRow compact label="Stripe transfer" value={week.stripeTransferId && <code className="text-xs break-all">{week.stripeTransferId}</code>} />
      <FieldRow compact label="Stripe refund" value={week.stripeRefundId && <code className="text-xs break-all">{week.stripeRefundId}</code>} />
    </SectionCard>
  );
}

export default function ViewDetails({ id }: { id: string }) {
  const { data, isLoading, error } = useBillingWeek(id);
  const week = data?.data;
  const attention = useMemo(() => {
    if (!week) return null;
    if (week.status === "DISPUTED") return "This week is disputed. Resolve it below.";
    if (week.failedLateCharges > 0) return "A late-session charge failed. Retry it once the supervisee updates their card.";
    if (week.pendingLateEntryRequests > 0)
      return "The supervisor asked for a late session to be added. Approve or decline it below.";
    if (week.prepayStatus === "FAILED" && week.status !== "SETTLED")
      return "The prepay failed. The supervisee was asked to tap Pay now.";
    return null;
  }, [week]);

  if (isLoading) return <FullScreenSpinner isVisible={true} message="Loading billing week..." />;

  if (error || !week) {
    return (
      <div className="px-4 pt-4 pb-2">
        <BackToListButton href={BACK} className="mb-6">
          Back to Payments
        </BackToListButton>
        <ErrorState message={error ? `Error loading billing week: ${error.message}` : "Billing week not found"} />
      </div>
    );
  }

  return (
    <div className="px-4 pt-4 pb-8">
      <BackToListButton href={BACK} className="mb-6">
        Back to Payments
      </BackToListButton>

      <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 mb-6">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {formatWeekRange(week.startDate, week.endDate)}
          </h2>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${WEEK_STATUS_CLASS[week.status]}`}>
            {WEEK_STATUS_LABEL[week.status]}
          </span>
        </div>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          {week.hire.supervisee.fullName || week.hire.supervisee.email} ({week.hire.supervisee.email}) →{" "}
          {week.hire.supervisor.fullName || week.hire.supervisor.email} ({week.hire.supervisor.email})
        </p>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          {formatCents(week.terms.hourlyRateCents)}/hour · up to {formatMinutes(week.terms.weeklyCapMinutes)} per
          week · {week.terms.platformFeeBps / 100}% platform fee · logging deadline{" "}
          {formatEasternDateTime(week.logDeadlineAt)} · review until {formatEasternDateTime(week.reviewEndsAt)}
        </p>
        {attention && (
          <p className="mt-3 flex items-center gap-2 text-sm text-red-700 dark:text-red-400">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            {attention}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          {week.status === "DISPUTED" && <ResolveDisputeCard week={week} />}
          {week.resolvedAt && (
            <SectionCard title="Dispute resolution">
              <FieldRow label="Disputed" value={formatEasternDateTime(week.disputedAt)} />
              <FieldRow label="Reason" value={week.disputeReason} />
              {week.disputeAttachments.length > 0 && (
                <FieldRow label="Evidence" value={<DisputeEvidence attachments={week.disputeAttachments} />} />
              )}
              <FieldRow label="Resolved" value={formatEasternDateTime(week.resolvedAt)} />
              <FieldRow label="Note" value={week.resolutionNote} />
            </SectionCard>
          )}
          <SessionsCard week={week} />
          <AddLateEntryCard week={week} />
        </div>
        <div className="space-y-6">
          <PaymentCard week={week} />
        </div>
      </div>
    </div>
  );
}
