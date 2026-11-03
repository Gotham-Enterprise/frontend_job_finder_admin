"use client";
import React, { useState } from "react";
import { AlertTriangle, FileText, MessageSquare } from "lucide-react";
import {
  useMonthlyPeriod,
  useMonthlyPeriodMessages,
  useResolveMonthlyDispute,
} from "@/services/hooks/useSupervisionMonthlyPayments";
import { MonthlyActivityEntry, MonthlyDisputeCategory, MonthlyPeriod } from "@/services/types/supervisionMonthlyPayments";
import {
  formatCalendarDate,
  formatCents,
  formatEasternDateTime,
  formatMinutes,
} from "@/services/utils/supervisionPaymentsFormat";
import ErrorState from "../../common/ErrorState";
import FullScreenSpinner from "../../ui/FullScreenSpinner";
import BackToListButton from "@/components/ui/BackToListButton";
import ConfirmationDialog from "@/components/ui/ConfirmationDialog";
import Input from "@/components/ui/input/Input";
import {
  MONTH_STATUS_CLASS,
  MONTH_STATUS_LABEL,
  PAYMENT_STATUS_CLASS,
  PAYMENT_STATUS_LABEL,
  monthAttention,
} from "./format";

const BACK = "/admin/supervision-payments?tab=monthly";

const textareaClass =
  "w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90";

const buttonClass =
  "inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed";

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">{title}</h3>
      </div>
      <div className="px-6 py-4">{children}</div>
    </div>
  );
}

function FieldRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-1 py-2 border-b border-gray-50 dark:border-gray-700/50 last:border-0">
      <span className="text-sm font-medium text-gray-500 dark:text-gray-400 flex-shrink-0 sm:w-36">{label}</span>
      <span className="text-sm text-gray-900 dark:text-white flex-1 min-w-0 break-words">
        {value ?? <span className="text-gray-400 italic">—</span>}
      </span>
    </div>
  );
}

const CATEGORY_LABEL: Record<MonthlyDisputeCategory, string> = {
  UNREACHABLE: "Couldn't reach the Medical Director",
  MISSED_MEETINGS: "Missed meetings or calls",
  NO_CHART_REVIEW: "Charts weren't reviewed",
  PROTOCOLS_NOT_SIGNED: "Protocols or standing orders weren't signed",
  UNPROFESSIONAL: "Unprofessional conduct",
  OTHER: "Other",
};

const ACTIVITY_LABEL: Record<MonthlyActivityEntry["type"], string> = {
  MEETING: "Meeting or call",
  CHART_REVIEW: "Chart review",
  PROTOCOL_REVIEW: "Protocols & standing orders",
  CONSULTATION: "Consultation",
  OTHER: "Other",
};

/** Both sides' submissions on the dispute, oldest first, with their files. */
function EvidenceCard({ period }: { period: MonthlyPeriod }) {
  const evidence = period.evidence ?? [];
  const client = period.hire?.supervisee.fullName || "Client";
  const md = period.hire?.supervisor.fullName || "Medical Director";
  return (
    <SectionCard title="Evidence">
      {evidence.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Nothing was attached (this month was reported before evidence could be added).
        </p>
      ) : (
        <ol className="space-y-4">
          {evidence.map((item, i) => (
            <li
              key={item.id}
              className={`rounded-lg border-l-4 px-4 py-3 ${
                item.authorRole === "SUPERVISOR"
                  ? "border-blue-400 bg-blue-50 dark:bg-blue-900/20"
                  : "border-amber-400 bg-amber-50 dark:bg-amber-900/20"
              }`}
            >
              <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                {item.authorRole === "SUPERVISOR"
                  ? `Medical Director · ${md}`
                  : `${i === 0 ? "Report" : "Client"} · ${client}`}{" "}
                <span className="font-normal text-gray-500 dark:text-gray-400">· {formatEasternDateTime(item.createdAt)}</span>
              </p>
              {item.note && <p className="mt-1 text-sm text-gray-900 dark:text-white whitespace-pre-wrap">{item.note}</p>}
              {item.files.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {item.files.map((f) => (
                    <a
                      key={f.id}
                      href={f.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={f.fileName}
                      className="block rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
                    >
                      {f.contentType.startsWith("image/") ? (
                        <img src={f.url} alt={f.fileName} className="h-20 w-20 rounded-md object-cover" />
                      ) : (
                        <span className="flex h-20 w-32 flex-col items-center justify-center gap-1 px-2">
                          <FileText className="h-5 w-5 text-gray-500" />
                          <span className="w-full truncate text-center text-xs text-gray-700 dark:text-gray-300">{f.fileName}</span>
                        </span>
                      )}
                    </a>
                  ))}
                </div>
              )}
            </li>
          ))}
        </ol>
      )}
    </SectionCard>
  );
}

function Stat({ label, value, warn = false }: { label: string; value: React.ReactNode; warn?: boolean }) {
  return (
    <div className="rounded-lg border border-gray-100 dark:border-gray-700 px-3 py-2">
      <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
      <p className={`mt-0.5 text-sm font-semibold ${warn ? "text-red-700 dark:text-red-400" : "text-gray-900 dark:text-white"}`}>
        {value}
      </p>
    </div>
  );
}

/**
 * A disputed month's hire chat: the numbers (always), and the messages behind
 * an explicit button — opening them is recorded with the admin's name.
 */
function ChatCard({ period }: { period: MonthlyPeriod }) {
  const open = useMonthlyPeriodMessages(period.id);
  const summary = period.chatSummary;
  const access = open.data?.data.accessLog ?? period.chatAccessLog ?? [];
  const messages = open.data?.data.messages;
  const client = period.hire?.supervisee.fullName || "Client";
  const md = period.hire?.supervisor.fullName || "Medical Director";

  return (
    <SectionCard title="Messages this month">
      {!summary ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">This hire has no chat room, so there are no messages.</p>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <Stat label="From the client" value={summary.clientMessages} />
            <Stat label="From the Medical Director" value={summary.mdMessages} />
            <Stat
              label={`Client waited over ${summary.replyWindowHours} h`}
              value={`${summary.unansweredRequests} of ${summary.clientRequests}`}
              warn={summary.unansweredRequests > 0}
            />
            <Stat
              label="Typical reply time"
              value={summary.medianReplyHours == null ? "No replies" : `${summary.medianReplyHours} h`}
            />
            <Stat
              label="Last Medical Director message"
              value={summary.lastMdMessageAt ? formatEasternDateTime(summary.lastMdMessageAt) : "None this month"}
              warn={!summary.lastMdMessageAt}
            />
            <Stat
              label="Client messages never opened"
              value={summary.clientMessagesNeverOpened}
              warn={summary.clientMessagesNeverOpened > 0}
            />
          </div>
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            A client &quot;request&quot; is one or more client messages in a row; it&apos;s answered by the Medical
            Director&apos;s next message. Replies up to {summary.replyWindowHours} h after the month ends count.
          </p>

          {messages ? (
            messages.length === 0 ? (
              <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">No messages this month.</p>
            ) : (
              <ol className="mt-4 space-y-2 max-h-[32rem] overflow-y-auto pr-1">
                {messages.map((m) => {
                  const fromMd = m.from === "SUPERVISOR";
                  return (
                    <li key={m.id} className={`flex ${fromMd ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                          fromMd
                            ? "bg-blue-50 text-gray-900 dark:bg-blue-900/30 dark:text-white"
                            : "bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-white"
                        }`}
                      >
                        <p className="text-xs font-medium text-gray-600 dark:text-gray-300">
                          {fromMd ? md : client} · {formatEasternDateTime(m.createdAt)}
                        </p>
                        <p className="mt-0.5 whitespace-pre-wrap break-words">
                          {m.body ?? <span className="italic text-gray-500">({m.type.toLowerCase()} message)</span>}
                        </p>
                        <p className="mt-0.5 text-[11px] text-gray-500 dark:text-gray-400">
                          {m.readAt ? `Read ${formatEasternDateTime(m.readAt)}` : "Not opened"}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ol>
            )
          ) : (
            <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-lg bg-gray-50 dark:bg-gray-900/40 px-4 py-3">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Read the messages only to review this dispute. Opening them is recorded with your name.
              </p>
              <button
                onClick={() => open.mutate()}
                disabled={open.isPending}
                className={`${buttonClass} shrink-0 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700`}
              >
                <MessageSquare className="h-4 w-4" />
                {open.isPending ? "Opening..." : "Show messages"}
              </button>
            </div>
          )}
        </>
      )}

      {access.length > 0 && (
        <div className="mt-4 border-t border-gray-100 dark:border-gray-700 pt-3">
          <p className="text-xs font-medium text-gray-600 dark:text-gray-300">Messages opened by</p>
          <ul className="mt-1 space-y-0.5 text-xs text-gray-500 dark:text-gray-400">
            {access.map((a, i) => (
              <li key={`${a.createdAt}-${i}`}>
                {a.adminName} · {formatEasternDateTime(a.createdAt)}
              </li>
            ))}
          </ul>
        </div>
      )}
    </SectionCard>
  );
}

/** What the Medical Director logged during the month — context for a dispute. */
function ActivityCard({ period }: { period: MonthlyPeriod }) {
  const activity = period.activity ?? [];
  const minutes = activity.reduce((sum, e) => sum + (e.durationMinutes ?? 0), 0);
  const charts = activity.reduce((sum, e) => sum + (e.chartCount ?? 0), 0);
  return (
    <SectionCard title="Medical Director's activity log">
      {activity.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">Nothing was logged for this month.</p>
      ) : (
        <>
          <p className="mb-3 text-sm text-gray-600 dark:text-gray-400">
            {activity.length} {activity.length === 1 ? "entry" : "entries"}
            {minutes > 0 && ` · ${formatMinutes(minutes)}`}
            {charts > 0 && ` · ${charts} chart${charts === 1 ? "" : "s"} reviewed`}
          </p>
          <ul className="divide-y divide-gray-100 dark:divide-gray-700">
            {activity.map((e) => (
              <li key={e.id} className="py-2.5">
                <p className="text-sm text-gray-900 dark:text-white">
                  <span className="font-medium">{formatCalendarDate(e.activityDate)}</span> · {ACTIVITY_LABEL[e.type]}
                  {e.durationMinutes ? ` · ${formatMinutes(e.durationMinutes)}` : ""}
                  {e.chartCount ? ` · ${e.chartCount} chart${e.chartCount === 1 ? "" : "s"}` : ""}
                </p>
                {e.notes && <p className="mt-0.5 text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">{e.notes}</p>}
                <div className="mt-1 flex flex-wrap gap-2 text-xs text-gray-500 dark:text-gray-400">
                  {e.loggedOn !== e.activityDate && <span>Logged {formatCalendarDate(e.loggedOn)}</span>}
                  {e.edited && <span>Edited</span>}
                  {e.addedAfterDispute && (
                    <span className="rounded bg-red-100 px-1.5 py-0.5 font-medium text-red-700 dark:bg-red-900/30 dark:text-red-300">
                      Added after the dispute
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </SectionCard>
  );
}

/** What the Medical Director gets and what's refunded when `releaseCents` of the month is released. */
function preview(period: MonthlyPeriod, releaseCents: number) {
  const earned = Math.min(Math.max(releaseCents, 0), period.amountCents);
  const fee = Math.round((earned * period.platformFeeBps) / 10000);
  return { payout: earned - fee, fee, refund: period.amountCents - earned };
}

function ResolveDisputeCard({ period }: { period: MonthlyPeriod }) {
  const resolve = useResolveMonthlyDispute(period.id);
  const [amount, setAmount] = useState((period.amountCents / 100).toFixed(2));
  const [note, setNote] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const releaseCents = Math.round(Number(amount) * 100);
  const valid = Number.isFinite(releaseCents) && releaseCents >= 0 && releaseCents <= period.amountCents;
  const p = preview(period, valid ? releaseCents : 0);

  return (
    <SectionCard title="Dispute">
      <div className="rounded-lg bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm text-red-800 dark:text-red-300">
        <p className="font-medium">
          Reported by {period.hire?.supervisee.fullName || "the client"} on {formatEasternDateTime(period.disputedAt)}
        </p>
        {period.disputeCategory && <p className="mt-1">Problem: {CATEGORY_LABEL[period.disputeCategory]}</p>}
        <p className="mt-1 whitespace-pre-wrap">{period.disputeReason}</p>
      </div>
      <div className="mt-4 space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Amount to release to the Medical Director (of {formatCents(period.amountCents)})
          </label>
          <Input type="number" min="0" step={0.01} value={amount} onChange={(e) => setAmount(e.target.value)} />
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {valid
            ? `Medical Director receives ${formatCents(p.payout)} (after a ${formatCents(p.fee)} platform fee); ${formatCents(p.refund)} is refunded to the client. The ${formatCents(period.serviceFeeCents)} service fee isn't refunded.`
            : `Enter an amount between $0 and ${formatCents(period.amountCents)}.`}
        </p>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Resolution note (shown to both parties)
          </label>
          <textarea
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g. Confirmed the Medical Director was unavailable Nov 10–24; releasing half the month."
            className={textareaClass}
          />
        </div>
        <div className="flex justify-end">
          <button
            onClick={() => setConfirmOpen(true)}
            disabled={!valid || note.trim().length < 5 || resolve.isPending}
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
          await resolve.mutateAsync({ approvedAmountCents: releaseCents, note: note.trim() });
          setConfirmOpen(false);
        }}
        title="Resolve dispute"
        message={
          releaseCents === 0
            ? "Release nothing to the Medical Director and refund the whole monthly amount? This can't be undone."
            : `Release ${formatCents(releaseCents)} to the Medical Director and refund ${formatCents(p.refund)}? This can't be undone.`
        }
        confirmText="Resolve"
        cancelText="Cancel"
        isLoading={resolve.isPending}
      />
    </SectionCard>
  );
}

export default function MonthlyPeriodDetails({ id }: { id: string }) {
  const { data, isLoading, error } = useMonthlyPeriod(id);
  const period = data?.data;

  if (isLoading) return <FullScreenSpinner isVisible={true} message="Loading month..." />;

  if (error || !period) {
    return (
      <div className="px-4 pt-4 pb-2">
        <BackToListButton href={BACK} className="mb-6">
          Back to Payments
        </BackToListButton>
        <ErrorState message={error ? `Error loading month: ${error.message}` : "Month not found"} />
      </div>
    );
  }

  const attention = monthAttention(period);
  const approvedBy =
    period.approvedBy === "SUPERVISEE"
      ? "Client (released early)"
      : period.approvedBy === "AUTO"
        ? "Automatically (window ended)"
        : period.approvedBy === "SUPPORT"
          ? "Gotham support"
          : null;

  return (
    <div className="px-4 pt-4 pb-8">
      <BackToListButton href={BACK} className="mb-6">
        Back to Payments
      </BackToListButton>

      <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 mb-6">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{period.label}</h2>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${MONTH_STATUS_CLASS[period.status]}`}>
            {MONTH_STATUS_LABEL[period.status]}
          </span>
        </div>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          {period.hire?.supervisee.fullName || period.hire?.supervisee.email} ({period.hire?.supervisee.email}) →{" "}
          {period.hire?.supervisor.fullName || period.hire?.supervisor.email} ({period.hire?.supervisor.email})
        </p>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Month {period.periodIndex + 1} · {formatCents(period.amountCents)}/month · {period.platformFeeBps / 100}% platform
          fee · released after {formatEasternDateTime(period.reviewEndsAt)} unless disputed
          {period.hire?.scheduledEndAt && ` · hire ends ${formatEasternDateTime(period.hire.scheduledEndAt)}`}
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
          {period.status === "DISPUTED" && <ResolveDisputeCard period={period} />}
          {period.resolvedAt && (
            <SectionCard title="Dispute resolution">
              <FieldRow label="Disputed" value={formatEasternDateTime(period.disputedAt)} />
              <FieldRow label="Problem" value={period.disputeCategory && CATEGORY_LABEL[period.disputeCategory]} />
              <FieldRow label="Reason" value={period.disputeReason} />
              <FieldRow label="Resolved" value={formatEasternDateTime(period.resolvedAt)} />
              <FieldRow label="Released" value={formatCents(period.approvedAmountCents)} />
              <FieldRow label="Note" value={period.resolutionNote} />
            </SectionCard>
          )}
          {period.disputedAt && <EvidenceCard period={period} />}
          {period.disputedAt && <ChatCard period={period} />}
          {period.activity && <ActivityCard period={period} />}
          {period.paymentStatus === "FAILED" && period.status === "OPEN" && (
            <SectionCard title="Unpaid">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                The charge failed{period.failureMessage ? ` (${period.failureMessage})` : ""}. The client was asked to
                tap Pay now; after {formatEasternDateTime(period.graceEndsAt)} the Medical Director may end the
                supervision. No new month is charged while this one is unpaid.
              </p>
            </SectionCard>
          )}
        </div>
        <div className="space-y-6">
          <SectionCard title="Payment">
            <FieldRow
              label="Charged"
              value={
                <>
                  {formatCents(period.totalCents)}{" "}
                  <span className="text-xs text-gray-500">
                    ({formatCents(period.amountCents)} + {formatCents(period.serviceFeeCents)} service fee)
                  </span>
                </>
              }
            />
            <FieldRow
              label="Payment"
              value={
                <span className={PAYMENT_STATUS_CLASS[period.paymentStatus]}>
                  {PAYMENT_STATUS_LABEL[period.paymentStatus]}
                  {period.paidAt && ` · ${formatEasternDateTime(period.paidAt)}`}
                </span>
              }
            />
            <FieldRow label="Released by" value={approvedBy} />
            <FieldRow label="MD paid" value={period.status === "SETTLED" ? formatCents(period.supervisorAmountCents) : null} />
            <FieldRow label="Platform fee" value={period.status === "SETTLED" ? formatCents(period.platformFeeCents) : null} />
            <FieldRow label="Refunded" value={period.status === "SETTLED" ? formatCents(period.refundCents) : null} />
            <FieldRow label="Settled" value={period.settledAt ? formatEasternDateTime(period.settledAt) : null} />
            <FieldRow label="Stripe payment" value={period.stripePaymentIntentId && <code className="text-xs break-all">{period.stripePaymentIntentId}</code>} />
            <FieldRow label="Stripe transfer" value={period.stripeTransferId && <code className="text-xs break-all">{period.stripeTransferId}</code>} />
            <FieldRow label="Stripe refund" value={period.stripeRefundId && <code className="text-xs break-all">{period.stripeRefundId}</code>} />
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
