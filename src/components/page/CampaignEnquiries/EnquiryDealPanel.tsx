"use client";

import React, { useEffect, useState } from "react";
import { Check, CircleDashed, Copy, ExternalLink, Loader2 } from "lucide-react";
import { type CampaignDeal } from "@/services/api/campaignDeals";
import { useCampaignDeal, useDealActions } from "@/services/hooks/useCampaignDeal";
import { showToast } from "@/services/utils/toast";
import { formatDateTime } from "./labels";

const input =
  "w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-gray-700 dark:bg-gray-800 dark:text-white";
const primary =
  "inline-flex items-center gap-2 rounded-lg bg-primary px-3.5 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50";
const secondary =
  "inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3.5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200";

const Step: React.FC<{ n: number; title: string; done: boolean; note?: React.ReactNode; children: React.ReactNode }> = ({ n, title, done, note, children }) => (
  <div className="border-t border-gray-100 py-4 first:border-t-0 first:pt-0 dark:border-gray-800">
    <div className="mb-3 flex items-center gap-2">
      <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${done ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300" : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"}`}>
        {done ? <Check className="h-3.5 w-3.5" /> : n}
      </span>
      <h4 className="m-0 text-sm font-semibold text-gray-900 dark:text-white">{title}</h4>
      {note && <span className="text-xs text-gray-500">{note}</span>}
    </div>
    <div className="space-y-3 pl-8">{children}</div>
  </div>
);

const Spinner = () => <Loader2 className="h-4 w-4 animate-spin" />;

// Turns an enquiry into a customer: a quote, an agreement, a Stripe payment link, then access to their credits.
export default function EnquiryDealPanel({ enquiryId }: { enquiryId: string }) {
  const { data: deal, isLoading } = useCampaignDeal(enquiryId);
  const act = useDealActions(enquiryId);

  const [emailCredits, setEmailCredits] = useState("");
  const [smsCredits, setSmsCredits] = useState("");
  const [price, setPrice] = useState("");
  const [notes, setNotes] = useState("");

  // Fill the form from the saved deal whenever it changes.
  useEffect(() => {
    setEmailCredits(deal ? String(deal.quote.emailCredits) : "");
    setSmsCredits(deal ? String(deal.quote.smsCredits) : "");
    setPrice(deal ? String(deal.quote.priceInCents / 100) : "");
    setNotes(deal?.quote.notes ?? "");
  }, [deal?.updatedAt, enquiryId]); // eslint-disable-line react-hooks/exhaustive-deps

  if (isLoading) {
    return (
      <section className="mt-4 rounded-lg border border-gray-200 p-4 dark:border-gray-800">
        <div className="h-24 animate-pulse rounded bg-gray-100 dark:bg-gray-800" />
      </section>
    );
  }

  const quoteDirty =
    !deal ||
    Number(emailCredits) !== deal.quote.emailCredits ||
    Number(smsCredits) !== deal.quote.smsCredits ||
    Math.round(Number(price) * 100) !== deal.quote.priceInCents ||
    (notes || "") !== (deal.quote.notes ?? "");
  const quoteValid = Number(emailCredits) >= 0 && Number(smsCredits) >= 0 && Number(emailCredits) + Number(smsCredits) > 0 && Number(price) > 0;
  const needsAgreement = deal ? deal.agreement.required : true;
  const busy = Object.values(act).some((m) => m.isPending);

  const copyLink = async (link: string) => {
    try {
      await navigator.clipboard.writeText(link);
      showToast.success("Copied", "The payment link is on your clipboard.");
    } catch {
      showToast.error("Could not copy", "Select the link and copy it.");
    }
  };

  const d: CampaignDeal | null = deal ?? null;

  return (
    <section className="mt-4 rounded-lg border border-gray-200 p-4 dark:border-gray-800">
      <div className="mb-4 flex items-center justify-between gap-2">
        <h3 className="m-0 text-sm font-semibold text-gray-900 dark:text-white">Quote &amp; Onboarding</h3>
        {d && <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700 dark:bg-gray-800 dark:text-gray-300">{d.status.replaceAll("_", " ").toLowerCase()}</span>}
      </div>

      {/* 1. Quote */}
      <Step n={1} title="Quote" done={Boolean(d?.quote.sentAt)} note={d?.quote.sentAt ? `Emailed ${formatDateTime(d.quote.sentAt)}` : undefined}>
        <div className="grid grid-cols-1 items-end gap-3 sm:grid-cols-3">
          <label className="text-sm">
            <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-gray-500">Email credits / month</span>
            <input type="number" min={0} inputMode="numeric" value={emailCredits} onChange={(e) => setEmailCredits(e.target.value)} className={input} disabled={Boolean(d?.payment.paidAt)} />
          </label>
          <label className="text-sm">
            <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-gray-500">Text credits / month</span>
            <input type="number" min={0} inputMode="numeric" value={smsCredits} onChange={(e) => setSmsCredits(e.target.value)} className={input} disabled={Boolean(d?.payment.paidAt)} />
          </label>
          <label className="text-sm">
            <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-gray-500">Price / month (USD)</span>
            <input type="number" min={0} step="0.01" inputMode="decimal" value={price} onChange={(e) => setPrice(e.target.value)} className={input} disabled={Boolean(d?.payment.paidAt)} />
          </label>
        </div>
        <label className="block text-sm">
          <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-gray-500">Notes for the customer (optional)</span>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} maxLength={2000} className={input} disabled={Boolean(d?.payment.paidAt)} />
        </label>
        {d?.quote.sentAt === null && d && !quoteDirty && <p className="m-0 text-xs text-gray-500">Saved. Email it to the customer when you are ready.</p>}
        <div className="flex flex-wrap gap-2">
          <button className={primary} disabled={busy || !quoteValid || !quoteDirty || Boolean(d?.payment.paidAt)} onClick={() => act.saveQuote.mutate({ emailCredits: Number(emailCredits), smsCredits: Number(smsCredits), priceInDollars: Number(price), notes })}>
            {act.saveQuote.isPending && <Spinner />} Save quote
          </button>
          <button className={secondary} disabled={busy || !d || quoteDirty || !d.quote.complete || Boolean(d.payment.paidAt)} onClick={() => d && act.sendQuote.mutate(d.id)}>
            {act.sendQuote.isPending && <Spinner />} {d?.quote.sentAt ? "Email the quote again" : "Email quote to customer"}
          </button>
        </div>
      </Step>

      {/* 2. The customer accepts the terms online (tick box). Nothing for the team to do. */}
      <Step
        n={2}
        title="Terms Accepted"
        done={Boolean(d?.agreement.signedAt)}
        note={
          d?.agreement.signedAt
            ? `Accepted ${formatDateTime(d.agreement.signedAt)}${d.agreement.termsVersion ? ` (terms ${d.agreement.termsVersion})` : ""}`
            : needsAgreement
              ? "Waiting for the customer"
              : "Not required"
        }
      >
        <p className="m-0 text-sm text-gray-700 dark:text-gray-300">
          {!d
            ? "Save the quote first."
            : !needsAgreement
              ? "Terms do not need to be accepted. The payment link can be made straight away."
              : d.agreement.signedAt
                ? `${d.agreement.signedBy ?? "The customer"} accepted the terms on ${formatDateTime(d.agreement.signedAt)}. The payment link was sent to them automatically.`
                : d.agreement.proposalViewedAt
                  ? `The customer opened the proposal on ${formatDateTime(d.agreement.proposalViewedAt)} and has not accepted yet.`
                  : d.quote.sentAt
                    ? "The quote was sent. The customer reads the plan and terms, ticks a box and goes straight to payment."
                    : "Send the quote. The customer accepts the terms on a page from the email and goes straight to payment."}
        </p>
      </Step>

      {/* 3. Payment */}
      <Step n={3} title="Payment Link (Stripe)" done={Boolean(d?.payment.paidAt)} note={d?.payment.paidAt ? `Paid ${formatDateTime(d.payment.paidAt)}` : d?.payment.sentAt ? `Emailed ${formatDateTime(d.payment.sentAt)}` : undefined}>
        {!d ? (
          <p className="m-0 text-sm text-gray-500">Save the quote first.</p>
        ) : d.payment.paidAt ? (
          <p className="m-0 text-sm text-gray-700 dark:text-gray-300">The customer has paid. Their plan renews every month on its own.</p>
        ) : (
          <>
            {d.payment.blockers.length > 0 && !d.payment.linkUrl && (
              <ul className="m-0 list-disc space-y-0.5 pl-5 text-sm text-amber-700 dark:text-amber-400">
                {d.payment.blockers.map((blocker) => <li key={blocker}>{blocker}</li>)}
              </ul>
            )}
            {d.payment.linkUrl && (
              <div className="flex gap-2">
                <input readOnly value={d.payment.linkUrl} onFocus={(e) => e.currentTarget.select()} className={`${input} font-mono text-xs`} />
                <button className={secondary} onClick={() => copyLink(d.payment.linkUrl as string)} title="Copy the Link"><Copy className="h-4 w-4" /></button>
                <a className={secondary} href={d.payment.linkUrl} target="_blank" rel="noopener noreferrer" title="Open the Link"><ExternalLink className="h-4 w-4" /></a>
              </div>
            )}
            <div className="flex flex-wrap gap-2">
              {!d.payment.linkUrl && (
                <button className={primary} disabled={busy || !d.payment.canCreateLink || quoteDirty} onClick={() => act.createPaymentLink.mutate(d.id)}>
                  {act.createPaymentLink.isPending && <Spinner />} Create payment link
                </button>
              )}
              {d.payment.linkUrl && (
                <button className={primary} disabled={busy} onClick={() => act.sendPaymentLink.mutate(d.id)}>
                  {act.sendPaymentLink.isPending && <Spinner />} {d.payment.sentAt ? "Email the link again" : "Email link to customer"}
                </button>
              )}
            </div>
            {quoteDirty && d.payment.canCreateLink && !d.payment.linkUrl && <p className="m-0 text-xs text-gray-500">Save the quote changes first.</p>}
          </>
        )}
      </Step>

      {/* 4. Access */}
      <Step n={4} title="Customer Access" done={Boolean(d?.access.activatedAt)} note={d?.access.activatedAt ? `Credits added ${formatDateTime(d.access.activatedAt)}` : undefined}>
        {!d ? (
          <p className="m-0 text-sm text-gray-500">Starts once the customer has paid.</p>
        ) : (
          <>
            <p className="m-0 flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
              {d.access.accountFound ? <Check className="mt-0.5 h-4 w-4 shrink-0 text-green-600" /> : <CircleDashed className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />}
              <span>
                {d.access.activatedAt
                  ? `Credits were added to ${d.access.companyName?.trim() || "their account"}. Each monthly renewal adds the next month's credits on its own.`
                  : d.access.accountFound
                  ? `Employer account found: ${d.access.companyName?.trim()}. The credits are added to it as soon as they pay.`
                  : `No employer account for ${d.contactEmail} yet. If they pay first, their credits are added automatically the first time they open their campaigns after registering with this email.`}
              </span>
            </p>
            {d.renewal?.paymentFailedAt && (
              <p className="m-0 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-300">
                The last renewal payment failed on {formatDateTime(d.renewal.paymentFailedAt)}. The customer and the sales inbox were emailed, and Stripe is retrying.
              </p>
            )}
            {d.renewal?.currentPeriodEnd && (
              <p className="m-0 text-sm text-gray-700 dark:text-gray-300">
                {d.renewal.creditsExpiredAt
                  ? `The plan was not renewed in time: leftover credits expired on ${formatDateTime(d.renewal.creditsExpiredAt)}.`
                  : d.renewal.locked
                  ? `The paid period ended ${formatDateTime(d.renewal.currentPeriodEnd)}. Leftover credits are locked until the plan renews and expire on ${formatDateTime(d.renewal.creditsExpireAt!)}.`
                  : `Paid until ${formatDateTime(d.renewal.currentPeriodEnd)}. Unused credits roll over when it renews.`}
              </p>
            )}
            {d.canSimulatePayment && (
              <div>
                <button className={secondary} disabled={busy} onClick={() => act.simulatePayment.mutate(d.id)}>
                  {act.simulatePayment.isPending && <Spinner />} Mark as paid (test only)
                </button>
                <p className="m-0 mt-1 text-xs text-gray-500">For local testing, when Stripe cannot reach this computer. Not available in production.</p>
              </div>
            )}
          </>
        )}
      </Step>
    </section>
  );
}
