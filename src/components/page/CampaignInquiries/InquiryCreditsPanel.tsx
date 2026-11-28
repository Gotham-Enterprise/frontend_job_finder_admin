"use client";

import React, { useState } from "react";
import { CheckCircle2, Copy, ExternalLink, Loader2 } from "lucide-react";
import { type CampaignInquiry } from "@/services/api/campaignInquiries";
import { useCreditTopup, useCreditTopupActions, useGrantInquiryCredits } from "@/services/hooks/useCampaignInquiries";
import { showToast } from "@/services/utils/toast";
import { formatDateTime } from "./labels";

const input =
  "w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-gray-700 dark:bg-gray-800 dark:text-white";
const label = "mb-1 block text-xs font-medium uppercase tracking-wide text-gray-500";
const primary =
  "inline-flex items-center gap-2 rounded-lg bg-primary px-3.5 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50";
const secondary =
  "inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3.5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200";

const whole = (value: string) => (/^\d+$/.test(value.trim()) ? Number(value.trim()) : value.trim() === "" ? 0 : NaN);
const money = (cents: number) => (cents / 100).toLocaleString("en-US", { style: "currency", currency: "USD" });
const creditsText = (email: number, sms: number) => [email > 0 && `${email.toLocaleString("en-US")} email`, sms > 0 && `${sms.toLocaleString("en-US")} text`].filter(Boolean).join(" and ");

// For a request from an existing customer: sell them one-off credits. The customer gets a one-time Stripe payment link and
// the credits are added when they pay. (Or add them free, for goodwill.) A bigger monthly plan is the quote below.
export default function InquiryCreditsPanel({ inquiry }: { inquiry: CampaignInquiry }) {
  const isCustomer = inquiry.source === "IN_APP" && Boolean(inquiry.companyId);
  const { data: topup } = useCreditTopup(inquiry.id, isCustomer);
  const act = useCreditTopupActions(inquiry.id);
  const grant = useGrantInquiryCredits();
  const [emailCredits, setEmailCredits] = useState("");
  const [smsCredits, setSmsCredits] = useState("");
  const [price, setPrice] = useState("");
  const [note, setNote] = useState("");

  if (!isCustomer) return null;

  const email = whole(emailCredits);
  const sms = whole(smsCredits);
  const dollars = Number(price);
  const creditsValid = Number.isInteger(email) && Number.isInteger(sms) && email + sms > 0 && email <= 1_000_000 && sms <= 1_000_000;
  const priceValid = price.trim() !== "" && Number.isFinite(dollars) && dollars >= 0.5 && dollars <= 100000;
  const busy = act.send.isPending || act.resend.isPending || act.cancel.isPending || act.simulate.isPending || grant.isPending;
  const grantedFree = inquiry.status === "CONVERTED" && /Added \d+ email \+ \d+ text credits/.test(inquiry.internalNotes ?? "");
  const pending = topup?.status === "PENDING" ? topup : null;

  const copyLink = async (link: string) => {
    try {
      await navigator.clipboard.writeText(link);
      showToast.success("Copied", "The payment link is on your clipboard.");
    } catch {
      showToast.error("Could not copy", "Select the link and copy it.");
    }
  };

  return (
    <section className="mt-4 rounded-lg border border-gray-200 p-4 dark:border-gray-800">
      <h3 className="m-0 text-sm font-semibold text-gray-900 dark:text-white">Sell One-Off Credits</h3>
      <p className="m-0 mt-1 text-xs text-gray-500">
        The customer pays once with a Stripe link and the credits are added as soon as the payment arrives. No new plan is created and nothing renews. For a bigger monthly plan, use the quote below instead.
      </p>

      {topup?.status === "PAID" ? (
        <p className="m-0 mt-3 flex items-start gap-2 text-sm text-green-700 dark:text-green-400">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
          Paid {money(topup.priceInCents)} on {topup.paidAt ? formatDateTime(topup.paidAt) : "—"}. {creditsText(topup.emailCredits, topup.smsCredits)} credits were added and the customer was emailed a receipt.
        </p>
      ) : grantedFree ? (
        <p className="m-0 mt-3 flex items-start gap-2 text-sm text-green-700 dark:text-green-400">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
          Credits were added free for this request (see the internal notes). The customer was emailed.
        </p>
      ) : (
        <div className="mt-3 space-y-3">
          {pending && (
            <div className="space-y-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-900/50 dark:bg-amber-900/20 dark:text-amber-200">
              <p className="m-0">
                <strong>Waiting for Payment:</strong> {creditsText(pending.emailCredits, pending.smsCredits)} credits for {money(pending.priceInCents)}
                {pending.sentAt ? `, link emailed ${formatDateTime(pending.sentAt)}` : ""}. Nothing is added until it is paid.
              </p>
              {pending.paymentUrl && (
                <div className="flex gap-2">
                  <input readOnly value={pending.paymentUrl} onFocus={(e) => e.currentTarget.select()} className={`${input} font-mono text-xs`} />
                  <button type="button" className={secondary} onClick={() => copyLink(pending.paymentUrl as string)} title="Copy the Link"><Copy className="h-4 w-4" /></button>
                  <a className={secondary} href={pending.paymentUrl} target="_blank" rel="noopener noreferrer" title="Open the Link"><ExternalLink className="h-4 w-4" /></a>
                </div>
              )}
              <div className="flex flex-wrap gap-2">
                <button type="button" className={secondary} disabled={busy} onClick={() => act.resend.mutate()}>
                  {act.resend.isPending && <Loader2 className="h-4 w-4 animate-spin" />} Email the Link Again
                </button>
                <button
                  type="button"
                  className={secondary}
                  disabled={busy}
                  onClick={() => window.confirm("Withdraw this payment link? It will stop working.") && act.cancel.mutate()}
                >
                  {act.cancel.isPending && <Loader2 className="h-4 w-4 animate-spin" />} Withdraw the Link
                </button>
                {pending.canSimulate && (
                  <button type="button" className={secondary} disabled={busy} onClick={() => act.simulate.mutate()}>
                    {act.simulate.isPending && <Loader2 className="h-4 w-4 animate-spin" />} Mark as Paid (test)
                  </button>
                )}
              </div>
            </div>
          )}

          <p className="m-0 text-xs font-medium text-gray-600 dark:text-gray-400">{pending ? "Change the offer (replaces the link above)" : "New Offer"}</p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <label className="text-sm">
              <span className={label}>Email Credits</span>
              <input inputMode="numeric" value={emailCredits} onChange={(e) => setEmailCredits(e.target.value)} placeholder="0" className={input} />
            </label>
            <label className="text-sm">
              <span className={label}>Text Credits</span>
              <input inputMode="numeric" value={smsCredits} onChange={(e) => setSmsCredits(e.target.value)} placeholder="0" className={input} />
            </label>
            <label className="text-sm">
              <span className={label}>Price (USD, one time)</span>
              <input inputMode="decimal" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="e.g. 49.00" className={input} />
            </label>
          </div>
          <label className="block text-sm">
            <span className={label}>Note (shown to the customer and in their credit history)</span>
            <input value={note} maxLength={300} onChange={(e) => setNote(e.target.value)} placeholder="e.g. One-off top-up as agreed on our call" className={input} />
          </label>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              className={primary}
              disabled={!creditsValid || !priceValid || busy}
              onClick={() => act.send.mutate({ emailCredits: email, smsCredits: sms, priceInDollars: dollars, note: note.trim() || undefined })}
            >
              {act.send.isPending && <Loader2 className="h-4 w-4 animate-spin" />} {pending ? "Send a New Payment Link" : "Send Payment Link"}
            </button>
            <button
              type="button"
              className={secondary}
              disabled={!creditsValid || busy || Boolean(pending)}
              title={pending ? "Withdraw the payment link first" : "Adds the credits now without charging"}
              onClick={() => {
                if (!window.confirm(`Add ${email} email and ${sms} text credits to ${inquiry.companyName} for free? This closes the request and emails the customer.`)) return;
                grant.mutate({ id: inquiry.id, emailCredits: email, smsCredits: sms, note: note.trim() || undefined });
              }}
            >
              {grant.isPending && <Loader2 className="h-4 w-4 animate-spin" />} Add Free Instead
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
