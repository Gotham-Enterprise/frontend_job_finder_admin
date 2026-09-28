"use client";

import Link from "next/link";
import { FC, useState } from "react";

import TableHeading from "@/components/tables/tableHeader";
import { ErrorState } from "@/components/common";
import Button from "@/components/ui/button/Button";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { useReviewCreative, useSpotlightReviewQueue } from "@/services/hooks/useSpotlight";
import { ReviewDecision, ReviewQueue as ReviewQueueData } from "@/services/types/spotlight";
import { showToast } from "@/services/utils/toast";

import { Card, EmptyRow, LoadingRow, ReviewDecisionModal, WaitingBadge, formatDateTime } from "./shared";

type QueueCreative = ReviewQueueData["creatives"][number];

const linkClass = "text-sm font-medium text-brand-500 hover:underline";

const ReviewQueue: FC = () => {
  const { data, isLoading, error } = useSpotlightReviewQueue();
  const { mutate: reviewCreative, isPending: isSaving } = useReviewCreative();
  const [pending, setPending] = useState<{ creative: QueueCreative; decision: ReviewDecision } | null>(null);

  const queue = data?.data;
  const total = queue ? queue.advertisers.length + queue.campaigns.length + queue.creatives.length : 0;

  const confirmCreative = (note: string) => {
    if (!pending) return;
    reviewCreative(
      { id: pending.creative.id, payload: { decision: pending.decision, note: note || undefined } },
      {
        onSuccess: () => {
          showToast.success("Ad reviewed", `"${pending.creative.name}" was updated and the advertiser was notified.`);
          setPending(null);
        },
        onError: (err) => showToast.error("Unable to review ad", err.message),
      },
    );
  };

  if (error) return <ErrorState message={`Error loading the review queue: ${error.message}`} />;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Review Queue</h2>
        <p className="text-sm text-gray-500 mt-1">
          {isLoading
            ? "Loading..."
            : total
              ? `${total} item${total === 1 ? "" : "s"} waiting, oldest first. Targets: advertisers 1–2 business days, campaigns and ads 24 business hours.`
              : "Nothing is waiting for review."}
        </p>
      </div>

      <Card title={`Advertisers awaiting verification (${queue?.advertisers.length ?? 0})`}>
        <Table>
          <TableHeading
            columns={[
              { key: "company", label: "Company" },
              { key: "website", label: "Website" },
              { key: "submitted", label: "Submitted" },
              { key: "waiting", label: "Waiting" },
              { key: "action", label: "Action", className: "text-right" },
            ]}
          />
          <TableBody>
            {isLoading && <LoadingRow colSpan={5} />}
            {!isLoading && !queue?.advertisers.length && <EmptyRow colSpan={5} message="No advertisers waiting" />}
            {queue?.advertisers.map((advertiser) => (
              <TableRow key={advertiser.id}>
                <TableCell className="py-4 px-4 text-sm text-gray-900 dark:text-white">{advertiser.companyName}</TableCell>
                <TableCell className="py-4 px-4">
                  <a href={advertiser.website} target="_blank" rel="noopener noreferrer" className={linkClass}>
                    {advertiser.website}
                  </a>
                </TableCell>
                <TableCell className="py-4 px-4 text-sm text-gray-700">{formatDateTime(advertiser.submittedAt)}</TableCell>
                <TableCell className="py-4 px-4">
                  <WaitingBadge hours={advertiser.hoursWaiting} type="advertiser" />
                </TableCell>
                <TableCell className="py-4 px-4 text-right">
                  <Link href={`/admin/spotlight/advertisers/${advertiser.id}`} className={linkClass}>
                    Review
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Card title={`Campaigns awaiting review (${queue?.campaigns.length ?? 0})`}>
        <Table>
          <TableHeading
            columns={[
              { key: "campaign", label: "Campaign" },
              { key: "advertiser", label: "Advertiser" },
              { key: "submitted", label: "Submitted" },
              { key: "waiting", label: "Waiting" },
              { key: "action", label: "Action", className: "text-right" },
            ]}
          />
          <TableBody>
            {isLoading && <LoadingRow colSpan={5} />}
            {!isLoading && !queue?.campaigns.length && <EmptyRow colSpan={5} message="No campaigns waiting" />}
            {queue?.campaigns.map((campaign) => (
              <TableRow key={campaign.id}>
                <TableCell className="py-4 px-4 text-sm text-gray-900 dark:text-white">{campaign.name}</TableCell>
                <TableCell className="py-4 px-4">
                  <Link href={`/admin/spotlight/advertisers/${campaign.advertiser.id}`} className={linkClass}>
                    {campaign.advertiser.companyName}
                  </Link>
                </TableCell>
                <TableCell className="py-4 px-4 text-sm text-gray-700">{formatDateTime(campaign.submittedAt)}</TableCell>
                <TableCell className="py-4 px-4">
                  <WaitingBadge hours={campaign.hoursWaiting} type="campaign" />
                </TableCell>
                <TableCell className="py-4 px-4 text-right">
                  <Link href={`/admin/spotlight/campaigns/${campaign.id}`} className={linkClass}>
                    Review
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Card title={`New ads on approved campaigns (${queue?.creatives.length ?? 0})`}>
        <Table>
          <TableHeading
            columns={[
              { key: "ad", label: "Ad" },
              { key: "campaign", label: "Campaign" },
              { key: "waiting", label: "Waiting" },
              { key: "action", label: "Action", className: "text-right" },
            ]}
          />
          <TableBody>
            {isLoading && <LoadingRow colSpan={4} />}
            {!isLoading && !queue?.creatives.length && <EmptyRow colSpan={4} message="No ads waiting" />}
            {queue?.creatives.map((creative) => (
              <TableRow key={creative.id}>
                <TableCell className="py-4 px-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={creative.imageUrl}
                      alt={creative.name}
                      className="h-16 w-auto max-w-[200px] rounded border border-gray-200 object-contain"
                    />
                    <div>
                      <p className="text-sm text-gray-900 dark:text-white">{creative.name}</p>
                      <p className="text-xs text-gray-500">
                        {creative.width}x{creative.height}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="py-4 px-4">
                  <Link href={`/admin/spotlight/campaigns/${creative.campaign.id}`} className={linkClass}>
                    {creative.campaign.name}
                  </Link>
                  <p className="text-xs text-gray-500">{creative.campaign.advertiser.companyName}</p>
                </TableCell>
                <TableCell className="py-4 px-4">
                  <WaitingBadge hours={creative.hoursWaiting} type="creative" />
                </TableCell>
                <TableCell className="py-4 px-4">
                  <div className="flex justify-end gap-2">
                    <Button size="sm" onClick={() => setPending({ creative, decision: "approved" })}>
                      Approve
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setPending({ creative, decision: "changes_requested" })}>
                      Changes
                    </Button>
                    <Button
                      size="sm"
                      className="bg-red-600 hover:bg-red-800"
                      onClick={() => setPending({ creative, decision: "rejected" })}
                    >
                      Reject
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <ReviewDecisionModal
        isOpen={Boolean(pending)}
        decision={pending?.decision ?? null}
        subject={pending ? `Ad "${pending.creative.name}" (${pending.creative.campaign.advertiser.companyName})` : ""}
        isSaving={isSaving}
        onClose={() => setPending(null)}
        onConfirm={confirmCreative}
      />
    </div>
  );
};

export default ReviewQueue;
