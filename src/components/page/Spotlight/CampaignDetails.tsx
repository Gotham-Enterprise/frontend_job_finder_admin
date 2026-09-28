"use client";

import Link from "next/link";
import { FC, useEffect, useState } from "react";

import { ErrorState } from "@/components/common";
import Select from "@/components/form/Select";
import BackToListButton from "@/components/ui/BackToListButton";
import Button from "@/components/ui/button/Button";
import FullScreenSpinner from "@/components/ui/FullScreenSpinner";
import { useReviewCampaign, useSetCampaignPaused, useSpotlightCampaign } from "@/services/hooks/useSpotlight";
import { CampaignDetail, Creative, ReviewDecision } from "@/services/types/spotlight";
import { showToast } from "@/services/utils/toast";

import {
  Card,
  DetailRow,
  PAGE_TYPE_LABELS,
  ReviewDecisionModal,
  StatusBadge,
  WaitingBadge,
  formatDate,
  formatDateTime,
  isAdvertiserActiveNow,
} from "./shared";

const SAME_AS_CAMPAIGN = "same";

const CreativeCard: FC<{ creative: Creative }> = ({ creative }) => (
  <div className="rounded-xl border border-gray-200 dark:border-gray-800 p-4 flex flex-col gap-3">
    <div className="flex items-start justify-between gap-2">
      <div>
        <p className="text-sm font-medium text-gray-900 dark:text-white">{creative.name}</p>
        <p className="text-xs text-gray-500">
          {creative.width}x{creative.height}
        </p>
      </div>
      <StatusBadge status={creative.reviewStatus} />
    </div>
    <div className="overflow-x-auto rounded bg-gray-50 p-2">
      {/* Shown at real size so reviewers see exactly what readers will see. */}
      <img src={creative.imageUrl} alt={creative.altText} width={creative.width} height={creative.height} className="max-w-none" />
    </div>
    <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <DetailRow label="Alt text">{creative.altText}</DetailRow>
      <DetailRow label="Headline">{creative.headline || "—"}</DetailRow>
      <DetailRow label="Body">{creative.body || "—"}</DetailRow>
      <DetailRow label="Button text">{creative.ctaText || "—"}</DetailRow>
      <div className="sm:col-span-2">
        <DetailRow label="Destination">
          <a href={creative.destinationUrl} target="_blank" rel="noopener noreferrer nofollow" className="text-brand-500 hover:underline">
            {creative.destinationUrl}
          </a>
        </DetailRow>
      </div>
    </dl>
    {creative.reviewNote && <p className="text-xs text-amber-800 bg-amber-50 rounded px-3 py-2">Note: {creative.reviewNote}</p>}
  </div>
);

/** Per-ad overrides shown inside the review modal; ads left on "same" follow the campaign decision. */
const CreativeDecisions: FC<{
  creatives: Creative[];
  value: Record<string, string>;
  onChange: (value: Record<string, string>) => void;
}> = ({ creatives, value, onChange }) => {
  if (creatives.length === 0) return null;
  const options = [
    { value: SAME_AS_CAMPAIGN, label: "Same as campaign" },
    { value: "approved", label: "Approve" },
    { value: "changes_requested", label: "Request changes" },
    { value: "rejected", label: "Reject" },
  ];
  return (
    <div className="flex flex-col gap-2 rounded-lg bg-gray-50 p-3">
      <p className="text-xs font-medium uppercase text-gray-500">Ads in this submission</p>
      {creatives.map((creative) => (
        <div key={creative.id} className="flex items-center justify-between gap-3">
          <span className="text-sm text-gray-800 truncate" title={creative.name}>
            <span className="font-medium">{creative.width}x{creative.height}</span> <span className="text-gray-500">{creative.name}</span>
          </span>
          <Select
            value={value[creative.id] ?? SAME_AS_CAMPAIGN}
            options={options}
            onChange={(next: string) => onChange({ ...value, [creative.id]: next })}
            className="w-44"
          />
        </div>
      ))}
      <p className="text-xs text-gray-500">An ad with its own decision uses the note below too.</p>
    </div>
  );
};

const ReviewActions: FC<{ campaign: CampaignDetail }> = ({ campaign }) => {
  const { mutate: review, isPending } = useReviewCampaign();
  const [decision, setDecision] = useState<ReviewDecision | null>(null);
  const [overrides, setOverrides] = useState<Record<string, string>>({});
  const submittedCreatives = campaign.creatives.filter((c) => c.reviewStatus === "submitted");
  const advertiserApproved = campaign.advertiser.status === "approved";

  useEffect(() => {
    if (decision) setOverrides({});
  }, [decision]);

  const onConfirm = (note: string) => {
    if (!decision) return;
    const creativeDecisions = Object.fromEntries(
      Object.entries(overrides)
        .filter(([, value]) => value !== SAME_AS_CAMPAIGN)
        .map(([creativeId, value]) => [creativeId, { decision: value as ReviewDecision, note: note || undefined }]),
    );
    review(
      { id: campaign.id, payload: { decision, note: note || undefined, creativeDecisions } },
      {
        onSuccess: () => {
          showToast.success("Campaign reviewed", "The advertiser was notified by email.");
          setDecision(null);
        },
        onError: (err) => showToast.error("Unable to review campaign", err.message),
      },
    );
  };

  return (
    <>
      <div className="flex flex-wrap gap-2">
        <Button disabled={isPending || !advertiserApproved} onClick={() => setDecision("approved")}>
          Approve
        </Button>
        <Button variant="outline" disabled={isPending} onClick={() => setDecision("changes_requested")}>
          Request changes
        </Button>
        <Button className="bg-red-600 hover:bg-red-800" disabled={isPending} onClick={() => setDecision("rejected")}>
          Reject
        </Button>
      </div>
      {!advertiserApproved && (
        <p className="text-sm text-amber-700 mt-2">Approve the advertiser account before approving this campaign.</p>
      )}
      <ReviewDecisionModal
        isOpen={Boolean(decision)}
        decision={decision}
        subject={`Campaign "${campaign.name}" by ${campaign.advertiser.companyName}`}
        isSaving={isPending}
        requireNote={Object.values(overrides).some((value) => value !== SAME_AS_CAMPAIGN && value !== "approved")}
        onClose={() => setDecision(null)}
        onConfirm={onConfirm}
      >
        <CreativeDecisions creatives={submittedCreatives} value={overrides} onChange={setOverrides} />
      </ReviewDecisionModal>
    </>
  );
};

const CampaignDetails: FC<{ id: string }> = ({ id }) => {
  const { data, isLoading, error } = useSpotlightCampaign(id);
  const { mutate: setPaused, isPending: isPausing } = useSetCampaignPaused();

  if (isLoading) return <FullScreenSpinner isVisible={true} message="Loading campaign..." />;

  const back = (
    <BackToListButton href="/admin/spotlight/campaigns" preserveState={true}>
      Back to Campaigns
    </BackToListButton>
  );
  if (error || !data) {
    return (
      <div className="flex flex-col gap-6">
        {back}
        <ErrorState message={`Error loading campaign: ${error?.message ?? "not found"}`} />
      </div>
    );
  }

  const campaign = data.data;
  const { advertiser } = campaign;
  const togglePause = (paused: boolean) =>
    setPaused(
      { id, paused },
      {
        onSuccess: () => showToast.success(paused ? "Campaign paused" : "Campaign resumed", "Serving updates within a minute."),
        onError: (err) => showToast.error("Action failed", err.message),
      },
    );

  return (
    <div className="flex flex-col gap-6">
      {back}

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">{campaign.name}</h2>
            <StatusBadge status={campaign.status} />
          </div>
          <p className="text-sm text-gray-500 mt-1">
            by{" "}
            <Link href={`/admin/spotlight/advertisers/${advertiser.id}`} className="text-brand-500 hover:underline">
              {advertiser.companyName}
            </Link>
          </p>
          {campaign.status === "submitted" && (
            <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
              Waiting <WaitingBadge hours={campaign.hoursWaiting} type="campaign" />
            </div>
          )}
        </div>
        <div>
          {campaign.status === "submitted" && <ReviewActions campaign={campaign} />}
          {campaign.status === "approved" && (
            <Button variant="outline" disabled={isPausing} onClick={() => togglePause(true)}>
              Pause
            </Button>
          )}
          {campaign.status === "paused" && (
            <Button disabled={isPausing} onClick={() => togglePause(false)}>
              Resume
            </Button>
          )}
        </div>
      </div>

      {campaign.reviewNote && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <strong>Last note to advertiser:</strong> {campaign.reviewNote}
        </div>
      )}

      <Card title="Campaign">
        <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4 px-6 py-5">
          <DetailRow label="Schedule">
            {formatDate(campaign.startDate)} – {campaign.endDate ? formatDate(campaign.endDate) : "no end"}
          </DetailRow>
          <DetailRow label="Advertiser status">
            <StatusBadge status={advertiser.status} />
          </DetailRow>
          <DetailRow label="Advertiser active period">
            {advertiser.activeFrom
              ? `${formatDate(advertiser.activeFrom)} – ${advertiser.activeUntil ? formatDate(advertiser.activeUntil) : "no end"}`
              : "Not set"}
            {!isAdvertiserActiveNow(advertiser.activeFrom, advertiser.activeUntil) && (
              <span className="block text-xs text-amber-700">Not serving today</span>
            )}
          </DetailRow>
          <DetailRow label="Placements">
            {campaign.placements.length
              ? campaign.placements.map((p) => `${p.name} (${p.sizes.join(", ")})`).join("; ")
              : "None"}
          </DetailRow>
          <DetailRow label="Targeting">
            {campaign.targetingRules.length
              ? campaign.targetingRules.map((r) => `${PAGE_TYPE_LABELS[r.pageType] ?? r.pageType} · ${r.key}: ${r.value}`).join("; ")
              : "All pages of its placements (run-of-site)"}
          </DetailRow>
          <DetailRow label="Submitted">{formatDateTime(campaign.submittedAt)}</DetailRow>
        </dl>
      </Card>

      <Card title={`Ads (${campaign.creatives.length})`}>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 px-6 py-5">
          {campaign.creatives.length === 0 && <p className="text-sm text-gray-500">No ads uploaded.</p>}
          {campaign.creatives.map((creative) => (
            <CreativeCard key={creative.id} creative={creative} />
          ))}
        </div>
      </Card>
    </div>
  );
};

export default CampaignDetails;
