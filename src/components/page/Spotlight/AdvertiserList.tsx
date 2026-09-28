"use client";

import Link from "next/link";
import { FC } from "react";

import Pagination from "@/components/tables/Pagination";
import TableHeading from "@/components/tables/tableHeader";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { useSpotlightAdvertisers } from "@/services/hooks/useSpotlight";
import { useSpotlightListFilters } from "@/services/hooks/useSpotlightListFilters";

import {
  Card,
  EmptyRow,
  LoadingRow,
  SearchBox,
  StatusBadge,
  StatusTabs,
  WaitingBadge,
  formatDate,
  isAdvertiserActiveNow,
} from "./shared";

const STATUS_OPTIONS = [
  { value: "", label: "All" },
  { value: "pending_verification", label: "Pending verification" },
  { value: "changes_requested", label: "Changes requested" },
  { value: "approved", label: "Approved" },
  { value: "suspended", label: "Suspended" },
  { value: "rejected", label: "Rejected" },
];

const AdvertiserList: FC = () => {
  const { filters, onFilterChange, onSearch } = useSpotlightListFilters("/admin/spotlight/advertisers");
  const { data, isFetching, error } = useSpotlightAdvertisers(filters);
  const advertisers = data?.data ?? [];

  return (
    <Card>
      <div className="flex flex-col gap-4 px-6 py-5 border-b border-gray-200 dark:border-gray-800">
        <h3 className="text-xl font-semibold text-gray-800 dark:text-white">Advertisers</h3>
        <StatusTabs value={filters.status ?? ""} options={STATUS_OPTIONS} onChange={(value) => onFilterChange("status", value)} />
        <SearchBox initialValue={filters.search} placeholder="Search by company or business email" onSearch={onSearch} />
      </div>
      <Table>
        <TableHeading
          columns={[
            { key: "company", label: "Company" },
            { key: "status", label: "Status" },
            { key: "active", label: "Active period" },
            { key: "campaigns", label: "Campaigns" },
            { key: "waiting", label: "Waiting" },
            { key: "action", label: "Action", className: "text-right" },
          ]}
        />
        <TableBody>
          {isFetching && <LoadingRow colSpan={6} />}
          {!isFetching && error && <EmptyRow colSpan={6} message={`Error loading advertisers: ${error.message}`} />}
          {!isFetching && !error && !advertisers.length && <EmptyRow colSpan={6} message="No advertisers found" />}
          {!isFetching &&
            advertisers.map((advertiser) => (
              <TableRow key={advertiser.id}>
                <TableCell className="py-4 px-4">
                  <p className="text-sm text-gray-900 dark:text-white">{advertiser.companyName}</p>
                  <p className="text-xs text-gray-500">{advertiser.businessEmail}</p>
                </TableCell>
                <TableCell className="py-4 px-4">
                  <StatusBadge status={advertiser.status} />
                </TableCell>
                <TableCell className="py-4 px-4 text-sm text-gray-700">
                  {advertiser.activeFrom ? (
                    <>
                      {formatDate(advertiser.activeFrom)} – {advertiser.activeUntil ? formatDate(advertiser.activeUntil) : "no end"}
                      {advertiser.status === "approved" && isAdvertiserActiveNow(advertiser.activeFrom, advertiser.activeUntil) && (
                        <span className="block text-xs text-green-700">Serving now</span>
                      )}
                    </>
                  ) : (
                    <span className="text-gray-500">Not set</span>
                  )}
                </TableCell>
                <TableCell className="py-4 px-4 text-sm text-gray-700">{advertiser._count.campaigns}</TableCell>
                <TableCell className="py-4 px-4">
                  <WaitingBadge hours={advertiser.hoursWaiting} type="advertiser" />
                </TableCell>
                <TableCell className="py-4 px-4 text-right">
                  <Link
                    href={`/admin/spotlight/advertisers/${advertiser.id}`}
                    className="text-sm font-medium text-brand-500 hover:underline"
                  >
                    Manage
                  </Link>
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
      {data && data.totalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800 flex justify-between items-center">
          <span className="text-sm text-gray-500">{data.total} advertisers</span>
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

export default AdvertiserList;
