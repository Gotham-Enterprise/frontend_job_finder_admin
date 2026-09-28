"use client";

import Link from "next/link";
import { FC } from "react";

import Pagination from "@/components/tables/Pagination";
import TableHeading from "@/components/tables/tableHeader";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { useSpotlightCampaigns } from "@/services/hooks/useSpotlight";
import { useSpotlightListFilters } from "@/services/hooks/useSpotlightListFilters";

import { Card, EmptyRow, LoadingRow, SearchBox, StatusBadge, StatusTabs, formatDate } from "./shared";

const STATUS_OPTIONS = [
  { value: "", label: "All" },
  { value: "submitted", label: "Awaiting review" },
  { value: "approved", label: "Approved" },
  { value: "paused", label: "Paused" },
  { value: "changes_requested", label: "Changes requested" },
  { value: "draft", label: "Draft" },
  { value: "rejected", label: "Rejected" },
  { value: "archived", label: "Archived" },
];

const CampaignList: FC = () => {
  const { filters, onFilterChange, onSearch } = useSpotlightListFilters("/admin/spotlight/campaigns");
  const { data, isFetching, error } = useSpotlightCampaigns(filters);
  const campaigns = data?.data ?? [];

  return (
    <Card>
      <div className="flex flex-col gap-4 px-6 py-5 border-b border-gray-200 dark:border-gray-800">
        <h3 className="text-xl font-semibold text-gray-800 dark:text-white">Campaigns</h3>
        <StatusTabs value={filters.status ?? ""} options={STATUS_OPTIONS} onChange={(value) => onFilterChange("status", value)} />
        <SearchBox initialValue={filters.search} placeholder="Search by campaign name" onSearch={onSearch} />
      </div>
      <Table>
        <TableHeading
          columns={[
            { key: "campaign", label: "Campaign" },
            { key: "advertiser", label: "Advertiser" },
            { key: "status", label: "Status" },
            { key: "schedule", label: "Schedule" },
            { key: "ads", label: "Ads" },
            { key: "action", label: "Action", className: "text-right" },
          ]}
        />
        <TableBody>
          {isFetching && <LoadingRow colSpan={6} />}
          {!isFetching && error && <EmptyRow colSpan={6} message={`Error loading campaigns: ${error.message}`} />}
          {!isFetching && !error && !campaigns.length && <EmptyRow colSpan={6} message="No campaigns found" />}
          {!isFetching &&
            campaigns.map((campaign) => (
              <TableRow key={campaign.id}>
                <TableCell className="py-4 px-4 text-sm text-gray-900 dark:text-white">{campaign.name}</TableCell>
                <TableCell className="py-4 px-4">
                  <Link
                    href={`/admin/spotlight/advertisers/${campaign.advertiser.id}`}
                    className="text-sm text-brand-500 hover:underline"
                  >
                    {campaign.advertiser.companyName}
                  </Link>
                </TableCell>
                <TableCell className="py-4 px-4">
                  <StatusBadge status={campaign.status} />
                </TableCell>
                <TableCell className="py-4 px-4 text-sm text-gray-700">
                  {formatDate(campaign.startDate)} – {campaign.endDate ? formatDate(campaign.endDate) : "no end"}
                </TableCell>
                <TableCell className="py-4 px-4 text-sm text-gray-700">{campaign._count.creatives}</TableCell>
                <TableCell className="py-4 px-4 text-right">
                  <Link
                    href={`/admin/spotlight/campaigns/${campaign.id}`}
                    className="text-sm font-medium text-brand-500 hover:underline"
                  >
                    {campaign.status === "submitted" ? "Review" : "View"}
                  </Link>
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
      {data && data.totalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800 flex justify-between items-center">
          <span className="text-sm text-gray-500">{data.total} campaigns</span>
          <Pagination
            currentPage={data.currentPage}
            totalPages={data.totalPages}
            onPageChange={(page) => onFilterChange("page", page)}
          />
        </div>
      )}
    </Card>
  );
};

export default CampaignList;
