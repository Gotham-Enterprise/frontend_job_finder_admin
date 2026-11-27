"use client";

import React, { useState } from "react";
import { Loader2, Plus } from "lucide-react";
import type { CampaignPlan } from "@/services/api/campaignPlans";
import { useCampaignPlans, useSaveCampaignPlan, useTogglePlan } from "@/services/hooks/useCampaignPlans";

const kindOf = (emailCredits: number, smsCredits: number) => (smsCredits > 0 && emailCredits > 0 ? "Text + Email" : smsCredits > 0 ? "Text only" : emailCredits > 0 ? "Email only" : "No credits");
const money = (cents: number) => `$${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: cents % 100 ? 2 : 0 })}`;
const input = "w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-primary dark:border-gray-700 dark:bg-gray-800 dark:text-white";
const primary = "inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50";
const secondary = "inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200";

type Draft = { name: string; summary: string; emailCredits: string; smsCredits: string; price: string; features: string; isPopular: boolean; sortOrder: string };
const toDraft = (plan?: CampaignPlan): Draft => ({
  name: plan?.name ?? "",
  summary: plan?.summary ?? "",
  emailCredits: String(plan?.emailCredits ?? 0),
  smsCredits: String(plan?.smsCredits ?? 0),
  price: plan ? String(plan.priceInCents / 100) : "",
  features: (plan?.features ?? []).join("\n"),
  isPopular: plan?.isPopular ?? false,
  sortOrder: String(plan?.sortOrder ?? 0),
});

function PlanForm({ plan, onDone }: { plan?: CampaignPlan; onDone: () => void }) {
  const [draft, setDraft] = useState<Draft>(toDraft(plan));
  const save = useSaveCampaignPlan();
  const set = (changes: Partial<Draft>) => setDraft((current) => ({ ...current, ...changes }));
  const cents = Math.round(Number(draft.price) * 100);
  const valid = draft.name.trim().length >= 2 && Number.isFinite(cents) && cents >= 100 && Number(draft.emailCredits) + Number(draft.smsCredits) > 0;

  const submit = () =>
    save.mutate(
      {
        id: plan?.id,
        input: {
          name: draft.name.trim(),
          summary: draft.summary.trim(),
          emailCredits: Number(draft.emailCredits),
          smsCredits: Number(draft.smsCredits),
          priceInCents: cents,
          features: draft.features.split("\n").map((line) => line.trim()).filter(Boolean),
          isPopular: draft.isPopular,
          sortOrder: Number(draft.sortOrder) || 0,
        },
      },
      { onSuccess: onDone },
    );

  return (
    <div className="space-y-4 rounded-xl border border-gray-200 bg-gray-50 p-5 dark:border-gray-800 dark:bg-gray-900">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm"><span className="mb-1 block text-xs font-medium uppercase tracking-wide text-gray-500">Plan name</span><input value={draft.name} maxLength={60} onChange={(e) => set({ name: e.target.value })} className={input} placeholder="Growth" /></label>
        <label className="block text-sm"><span className="mb-1 block text-xs font-medium uppercase tracking-wide text-gray-500">Price per month (USD)</span><input type="number" min={1} step="0.01" value={draft.price} onChange={(e) => set({ price: e.target.value })} className={input} placeholder="149" /></label>
        <label className="block text-sm"><span className="mb-1 block text-xs font-medium uppercase tracking-wide text-gray-500">Email credits per month</span><input type="number" min={0} value={draft.emailCredits} onChange={(e) => set({ emailCredits: e.target.value })} className={input} /></label>
        <label className="block text-sm"><span className="mb-1 block text-xs font-medium uppercase tracking-wide text-gray-500">Text credits per month</span><input type="number" min={0} value={draft.smsCredits} onChange={(e) => set({ smsCredits: e.target.value })} className={input} /></label>
      </div>
      <p className="m-0 text-xs text-gray-500">This plan is <b>{kindOf(Number(draft.emailCredits), Number(draft.smsCredits))}</b>. Set one kind of credit to 0 for a text-only or email-only plan. Customers see each kind in its own tab, so each can have its own price.</p>
      <label className="block text-sm"><span className="mb-1 block text-xs font-medium uppercase tracking-wide text-gray-500">Short description (shown under the name)</span><input value={draft.summary} maxLength={200} onChange={(e) => set({ summary: e.target.value })} className={input} /></label>
      <label className="block text-sm"><span className="mb-1 block text-xs font-medium uppercase tracking-wide text-gray-500">Included features (one per line, up to 10)</span><textarea rows={4} value={draft.features} onChange={(e) => set({ features: e.target.value })} className={input} /></label>
      <div className="flex flex-wrap items-center gap-6">
        <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300"><input type="checkbox" checked={draft.isPopular} onChange={(e) => set({ isPopular: e.target.checked })} className="h-4 w-4" />Mark as &ldquo;Most popular&rdquo;</label>
        <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">Order on the Page<input type="number" min={0} value={draft.sortOrder} onChange={(e) => set({ sortOrder: e.target.value })} className={`${input} w-20`} /></label>
      </div>
      {plan && plan.subscribers > 0 && (
        <p className="m-0 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:bg-amber-900/20 dark:text-amber-200">
          {plan.subscribers} customer{plan.subscribers === 1 ? " is" : "s are"} on this plan. Changing the price or credits only affects people who subscribe from now on. Current subscribers keep what they bought.
        </p>
      )}
      <div className="flex gap-2">
        <button className={primary} disabled={!valid || save.isPending} onClick={submit}>{save.isPending && <Loader2 className="h-4 w-4 animate-spin" />}{plan ? "Save changes" : "Create plan"}</button>
        <button className={secondary} onClick={onDone}>Cancel</button>
      </div>
    </div>
  );
}

function PlanRow({ plan }: { plan: CampaignPlan }) {
  const [editing, setEditing] = useState(false);
  const toggle = useTogglePlan();
  if (editing) return <PlanForm plan={plan} onDone={() => setEditing(false)} />;
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
      <div>
        <p className="m-0 text-base font-semibold text-gray-900 dark:text-white">
          {plan.name}
          {plan.isPopular && <span className="ml-2 rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">Most popular</span>}
          <span className="ml-2 rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">{kindOf(plan.emailCredits, plan.smsCredits)}</span>
          <span className={`ml-2 rounded-full px-2 py-0.5 text-xs font-medium ${plan.isActive ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-600"}`}>{plan.isActive ? "Live" : "Hidden"}</span>
        </p>
        <p className="m-0 mt-1 text-sm text-gray-600 dark:text-gray-400">
          {money(plan.priceInCents)} per month · {plan.emailCredits.toLocaleString()} email + {plan.smsCredits.toLocaleString()} text credits · {plan.subscribers} subscriber{plan.subscribers === 1 ? "" : "s"}
        </p>
      </div>
      <div className="flex gap-2">
        <button className={secondary} onClick={() => setEditing(true)}>Edit</button>
        <button className={secondary} disabled={toggle.isPending} onClick={() => toggle.mutate({ id: plan.id, isActive: !plan.isActive })}>
          {toggle.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          {plan.isActive ? "Hide" : "Switch on"}
        </button>
      </div>
    </div>
  );
}

// The monthly plans employers can buy themselves, without a sales rep.
export default function CampaignPlans() {
  const { data: plans, isLoading, isError, error } = useCampaignPlans();
  const [creating, setCreating] = useState(false);
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="m-0 text-xl font-semibold text-gray-900 dark:text-white">Self-Serve Plans</h1>
          <p className="m-0 mt-1 max-w-2xl text-sm text-gray-600 dark:text-gray-400">
            The monthly plans employers can buy by themselves. Each plan gives separate email and text credits every month. Hidden plans cannot be bought. Customers who already subscribed are never changed by an edit.
          </p>
        </div>
        {!creating && <button className={primary} onClick={() => setCreating(true)}><Plus className="h-4 w-4" />New plan</button>}
      </div>
      {creating && <PlanForm onDone={() => setCreating(false)} />}
      {isLoading && <div className="flex justify-center py-12 text-gray-500"><Loader2 className="h-6 w-6 animate-spin" /></div>}
      {isError && <p className="m-0 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{(error as Error).message}</p>}
      {plans?.length === 0 && !creating && <p className="m-0 text-sm text-gray-500">No plans yet. Create one, then switch it on.</p>}
      <div className="space-y-3">{plans?.map((plan) => <PlanRow key={plan.id} plan={plan} />)}</div>
    </div>
  );
}
