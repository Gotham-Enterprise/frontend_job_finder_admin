"use client";
import React, { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { useMonthlyPeriod, useResolveMonthlyDispute } from "@/services/hooks/useSupervisionMonthlyPayments";
import { MonthlyPeriod } from "@/services/types/supervisionMonthlyPayments";
import { formatCents, formatEasternDateTime } from "@/services/utils/supervisionPaymentsFormat";
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
              <FieldRow label="Reason" value={period.disputeReason} />
              <FieldRow label="Resolved" value={formatEasternDateTime(period.resolvedAt)} />
              <FieldRow label="Released" value={formatCents(period.approvedAmountCents)} />
              <FieldRow label="Note" value={period.resolutionNote} />
            </SectionCard>
          )}
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
