"use client";

import Link from "next/link";
import { FC, useEffect, useState } from "react";

import { ErrorState } from "@/components/common";
import BackToListButton from "@/components/ui/BackToListButton";
import Button from "@/components/ui/button/Button";
import FullScreenSpinner from "@/components/ui/FullScreenSpinner";
import Input from "@/components/ui/input/Input";
import {
  useReinstateAdvertiser,
  useReviewAdvertiser,
  useSetActivePeriod,
  useSpotlightAdvertiser,
  useSuspendAdvertiser,
} from "@/services/hooks/useSpotlight";
import { AdvertiserDetail, ReviewDecision } from "@/services/types/spotlight";
import { showToast } from "@/services/utils/toast";

import {
  Card,
  DetailRow,
  ReviewDecisionModal,
  StatusBadge,
  WaitingBadge,
  formatDate,
  formatDateTime,
  isAdvertiserActiveNow,
  toDateInput,
} from "./shared";

const ActivePeriodForm: FC<{ advertiser: AdvertiserDetail }> = ({ advertiser }) => {
  const [from, setFrom] = useState(toDateInput(advertiser.activeFrom));
  const [until, setUntil] = useState(toDateInput(advertiser.activeUntil));
  const { mutate: save, isPending } = useSetActivePeriod();

  useEffect(() => {
    setFrom(toDateInput(advertiser.activeFrom));
    setUntil(toDateInput(advertiser.activeUntil));
  }, [advertiser.activeFrom, advertiser.activeUntil]);

  const invalid = Boolean(from && until && until < from) || Boolean(until && !from);
  const serving = advertiser.status === "approved" && isAdvertiserActiveNow(advertiser.activeFrom, advertiser.activeUntil);

  const onSave = () => {
    save(
      {
        id: advertiser.id,
        // Start of the first day through the end of the last day, in the admin's timezone.
        activeFrom: from ? new Date(`${from}T00:00:00`).toISOString() : null,
        activeUntil: until ? new Date(`${until}T23:59:59`).toISOString() : null,
      },
      {
        onSuccess: () => showToast.success("Active period saved", "Ads follow the new dates within a minute."),
        onError: (err) => showToast.error("Unable to save active period", err.message),
      },
    );
  };

  return (
    <Card title="Active period (subscription)">
      <div className="px-6 py-5 flex flex-col gap-4">
        <p className="text-sm text-gray-500">
          Until billing is automated, ads only serve between these dates. Leave the end date empty for no end.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="text-sm text-gray-700 flex flex-col gap-1">
            Start date
            <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          </label>
          <label className="text-sm text-gray-700 flex flex-col gap-1">
            End date
            <Input type="date" value={until} min={from || undefined} onChange={(e) => setUntil(e.target.value)} />
          </label>
        </div>
        {invalid && <p className="text-sm text-red-600">Set a start date, and make the end date on or after it.</p>}
        <div className="flex items-center justify-between gap-3">
          <p className={`text-sm ${serving ? "text-green-700" : "text-gray-500"}`}>
            {serving
              ? "Ads can serve right now."
              : advertiser.status === "approved"
                ? "Ads are not serving: today is outside the active period."
                : "Ads only serve once the advertiser is approved."}
          </p>
          <div className="flex gap-2">
            {(advertiser.activeFrom || advertiser.activeUntil) && (
              <Button variant="outline" disabled={isPending} onClick={() => { setFrom(""); setUntil(""); }}>
                Clear
              </Button>
            )}
            <Button disabled={isPending || invalid} onClick={onSave}>
              {isPending ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};

const AdvertiserDetails: FC<{ id: string }> = ({ id }) => {
  const { data, isLoading, error } = useSpotlightAdvertiser(id);
  const { mutate: review, isPending: isReviewing } = useReviewAdvertiser();
  const { mutate: suspend, isPending: isSuspending } = useSuspendAdvertiser();
  const { mutate: reinstate, isPending: isReinstating } = useReinstateAdvertiser();
  const [decision, setDecision] = useState<ReviewDecision | "suspend" | null>(null);

  if (isLoading) return <FullScreenSpinner isVisible={true} message="Loading advertiser..." />;

  const back = (
    <BackToListButton href="/admin/spotlight/advertisers" preserveState={true}>
      Back to Advertisers
    </BackToListButton>
  );
  if (error || !data) {
    return (
      <div className="flex flex-col gap-6">
        {back}
        <ErrorState message={`Error loading advertiser: ${error?.message ?? "not found"}`} />
      </div>
    );
  }

  const advertiser = data.data;
  const isSaving = isReviewing || isSuspending || isReinstating;
  const onDone = (title: string) => ({
    onSuccess: () => {
      showToast.success(title, "The advertiser was notified by email.");
      setDecision(null);
    },
    onError: (err: Error) => showToast.error("Action failed", err.message),
  });

  const onConfirm = (note: string) => {
    if (decision === "suspend") {
      suspend({ id, note }, onDone("Advertiser suspended"));
    } else if (decision) {
      review({ id, payload: { decision, note: note || undefined } }, onDone("Review saved"));
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {back}

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">{advertiser.companyName}</h2>
            <StatusBadge status={advertiser.status} />
          </div>
          {advertiser.status === "pending_verification" && (
            <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
              Waiting <WaitingBadge hours={advertiser.hoursWaiting} type="advertiser" />
            </div>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {advertiser.status === "pending_verification" && (
            <>
              <Button disabled={isSaving} onClick={() => setDecision("approved")}>
                Approve
              </Button>
              <Button variant="outline" disabled={isSaving} onClick={() => setDecision("changes_requested")}>
                Request changes
              </Button>
              <Button className="bg-red-600 hover:bg-red-800" disabled={isSaving} onClick={() => setDecision("rejected")}>
                Reject
              </Button>
            </>
          )}
          {advertiser.status === "approved" && (
            <Button className="bg-red-600 hover:bg-red-800" disabled={isSaving} onClick={() => setDecision("suspend")}>
              Suspend
            </Button>
          )}
          {advertiser.status === "suspended" && (
            <Button disabled={isSaving} onClick={() => reinstate(id, onDone("Advertiser reinstated"))}>
              {isReinstating ? "Saving..." : "Reinstate"}
            </Button>
          )}
        </div>
      </div>

      {advertiser.reviewNote && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <strong>Last note to advertiser:</strong> {advertiser.reviewNote}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 flex flex-col gap-6">
          <Card title="Company">
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 px-6 py-5">
              <DetailRow label="Business email">{advertiser.businessEmail}</DetailRow>
              <DetailRow label="Contact person">{advertiser.contactPerson}</DetailRow>
              <DetailRow label="Contact number">{advertiser.contactNumber}</DetailRow>
              <DetailRow label="Website">
                <a href={advertiser.website} target="_blank" rel="noopener noreferrer" className="text-brand-500 hover:underline">
                  {advertiser.website}
                </a>
              </DetailRow>
              <DetailRow label="Business address">{advertiser.businessAddress}</DetailRow>
              <DetailRow label="Country">{advertiser.country || "—"}</DetailRow>
              <DetailRow label="Registration number">{advertiser.businessRegistrationNumber || "—"}</DetailRow>
              <DetailRow label="Signed up">{formatDateTime(advertiser.createdAt)}</DetailRow>
              <DetailRow label="Submitted for review">{formatDateTime(advertiser.submittedAt)}</DetailRow>
              <DetailRow label="Verified">{formatDateTime(advertiser.verifiedAt)}</DetailRow>
            </dl>
          </Card>

          <Card title="Verification documents">
            <div className="px-6 py-5">
              {advertiser.documents.length === 0 ? (
                <p className="text-sm text-gray-500">No documents uploaded.</p>
              ) : (
                <ul className="flex flex-col gap-3">
                  {advertiser.documents.map((document) => (
                    <li key={document.id} className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="text-sm text-gray-900 dark:text-white">{document.fileName}</p>
                        <p className="text-xs text-gray-500">
                          {document.mimeType} · {(document.sizeBytes / 1024).toFixed(0)} KB · uploaded {formatDate(document.createdAt)}
                        </p>
                      </div>
                      <a
                        href={document.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium text-brand-500 hover:underline"
                      >
                        Open document
                      </a>
                    </li>
                  ))}
                </ul>
              )}
              <p className="text-xs text-gray-400 mt-4">Document links expire after 1 hour; reload the page for a fresh link.</p>
            </div>
          </Card>

          <Card title={`Campaigns (${advertiser.campaigns.length})`}>
            <div className="px-6 py-5">
              {advertiser.campaigns.length === 0 ? (
                <p className="text-sm text-gray-500">No campaigns yet.</p>
              ) : (
                <ul className="divide-y divide-gray-100">
                  {advertiser.campaigns.map((campaign) => (
                    <li key={campaign.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                      <div>
                        <Link href={`/admin/spotlight/campaigns/${campaign.id}`} className="text-sm font-medium text-brand-500 hover:underline">
                          {campaign.name}
                        </Link>
                        <p className="text-xs text-gray-500">
                          {formatDate(campaign.startDate)} – {campaign.endDate ? formatDate(campaign.endDate) : "no end"}
                        </p>
                      </div>
                      <StatusBadge status={campaign.status} />
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </Card>
        </div>

        <div className="flex flex-col gap-6">
          <ActivePeriodForm advertiser={advertiser} />
          <Card title="Account users">
            <ul className="px-6 py-5 flex flex-col gap-3">
              {advertiser.members.length === 0 && <li className="text-sm text-gray-500">No users linked.</li>}
              {advertiser.members.map(({ memberRole, user }) => (
                <li key={user.id}>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {user.firstName} {user.lastName} <span className="text-xs text-gray-500">({memberRole})</span>
                  </p>
                  <p className="text-xs text-gray-500">
                    {user.email} · {user.emailVerifiedAt ? "email verified" : "email not verified"}
                  </p>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>

      <ReviewDecisionModal
        isOpen={Boolean(decision)}
        decision={decision}
        subject={advertiser.companyName}
        isSaving={isSaving}
        onClose={() => setDecision(null)}
        onConfirm={onConfirm}
      />
    </div>
  );
};

export default AdvertiserDetails;
