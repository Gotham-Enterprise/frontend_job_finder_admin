"use client";

import dynamic from "next/dynamic";
import { FC, useMemo, useState } from "react";

import Select from "@/components/form/Select";
import TableHeading from "@/components/tables/tableHeader";
import Button from "@/components/ui/button/Button";
import Input from "@/components/ui/input/Input";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { useSpotlightAdvertisers, useSpotlightReport } from "@/services/hooks/useSpotlight";
import { Metrics, Report } from "@/services/types/spotlight";

import { Card, EmptyRow, LoadingRow, formatNumber, toDateInput } from "./shared";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

const ALL_ADVERTISERS = "all";

const daysAgo = (days: number) => toDateInput(new Date(Date.now() - days * 86400000).toISOString());

const csvCell = (value: string | number) => {
  const text = String(value);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

/** One CSV with the daily series and the per-campaign totals, for sending to advertisers. */
const downloadCsv = (report: Report, label: string) => {
  const lines = [
    ["Daily", "", "", ""],
    ["Date", "Impressions", "Clicks", "CTR %"],
    ...report.daily.map((d) => [d.date, d.impressions, d.clicks, d.ctr]),
    [],
    ["By campaign", "", "", "", ""],
    ["Advertiser", "Campaign", "Impressions", "Clicks", "CTR %"],
    ...report.byCampaign.map((c) => [c.advertiserName, c.campaignName, c.impressions, c.clicks, c.ctr]),
  ];
  const csv = lines.map((line) => line.map(csvCell).join(",")).join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = `sponsored-content-report-${label}-${report.from}-to-${report.to}.csv`;
  link.click();
  URL.revokeObjectURL(url);
};

const MetricsTable: FC<{
  title: string;
  rows: (Metrics & { key: string; label: string; sublabel?: string })[];
  isLoading: boolean;
}> = ({ title, rows, isLoading }) => (
  <Card title={title}>
    <Table>
      <TableHeading
        columns={[
          { key: "name", label: "Name" },
          { key: "impressions", label: "Impressions", className: "text-right" },
          { key: "clicks", label: "Clicks", className: "text-right" },
          { key: "ctr", label: "CTR", className: "text-right" },
        ]}
      />
      <TableBody>
        {isLoading && <LoadingRow colSpan={4} />}
        {!isLoading && !rows.length && <EmptyRow colSpan={4} message="No data for this period" />}
        {!isLoading &&
          rows.map((row) => (
            <TableRow key={row.key}>
              <TableCell className="py-3 px-4">
                <p className="text-sm text-gray-900 dark:text-white">{row.label}</p>
                {row.sublabel && <p className="text-xs text-gray-500">{row.sublabel}</p>}
              </TableCell>
              <TableCell className="py-3 px-4 text-sm text-right">{formatNumber(row.impressions)}</TableCell>
              <TableCell className="py-3 px-4 text-sm text-right">{formatNumber(row.clicks)}</TableCell>
              <TableCell className="py-3 px-4 text-sm text-right">{row.ctr.toFixed(2)}%</TableCell>
            </TableRow>
          ))}
      </TableBody>
    </Table>
  </Card>
);

const Reports: FC = () => {
  const [from, setFrom] = useState(daysAgo(29));
  const [to, setTo] = useState(daysAgo(0));
  const [advertiserId, setAdvertiserId] = useState("");

  const { data: advertisers } = useSpotlightAdvertisers({ status: "", limit: 100, page: 1 });
  const { data, isFetching, error } = useSpotlightReport({ from, to, advertiserId: advertiserId || undefined });
  const report = data?.data;

  const advertiserOptions = useMemo(
    () => [
      // The shared Select reserves "" for its disabled placeholder, so "all" stands for no filter.
      { value: ALL_ADVERTISERS, label: "All advertisers" },
      ...(advertisers?.data ?? []).map((a) => ({ value: a.id, label: a.companyName })),
    ],
    [advertisers],
  );
  const advertiserLabel = advertiserOptions.find((o) => o.value === (advertiserId || ALL_ADVERTISERS))?.label ?? "all";

  const chartOptions = useMemo(
    () => ({
      chart: { type: "line" as const, toolbar: { show: false }, fontFamily: "Outfit, sans-serif" },
      stroke: { curve: "smooth" as const, width: 2 },
      colors: ["#465fff", "#12b76a"],
      xaxis: { categories: report?.daily.map((d) => d.date.slice(5)) ?? [] },
      yaxis: [
        { title: { text: "Impressions" }, labels: { formatter: (v: number) => formatNumber(Math.round(v)) } },
        { opposite: true, title: { text: "Clicks" }, labels: { formatter: (v: number) => formatNumber(Math.round(v)) } },
      ],
      legend: { position: "top" as const },
      dataLabels: { enabled: false },
    }),
    [report],
  );
  const chartSeries = useMemo(
    () => [
      { name: "Impressions", data: report?.daily.map((d) => d.impressions) ?? [] },
      { name: "Clicks", data: report?.daily.map((d) => d.clicks) ?? [] },
    ],
    [report],
  );

  return (
    <div className="flex flex-col gap-6">
      <Card
        title="Reports"
        actions={
          <Button variant="outline" disabled={!report || isFetching} onClick={() => report && downloadCsv(report, advertiserLabel.replace(/\W+/g, "-").toLowerCase())}>
            Export CSV
          </Button>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 px-6 py-5">
          <label className="text-sm text-gray-700 flex flex-col gap-1">
            From
            <Input type="date" value={from} max={to} onChange={(e) => setFrom(e.target.value)} />
          </label>
          <label className="text-sm text-gray-700 flex flex-col gap-1">
            To
            <Input type="date" value={to} min={from} onChange={(e) => setTo(e.target.value)} />
          </label>
          <label className="text-sm text-gray-700 flex flex-col gap-1">
            Advertiser
            <Select
              value={advertiserId || ALL_ADVERTISERS}
              options={advertiserOptions}
              onChange={(value: string) => setAdvertiserId(value === ALL_ADVERTISERS ? "" : value)}
            />
          </label>
        </div>
        {error && <p className="px-6 pb-5 text-sm text-red-600">Error loading report: {error.message}</p>}
        <p className="px-6 pb-5 text-xs text-gray-500">
          Impressions count only when at least half of the ad was on screen for 1 second. Days are in UTC.
        </p>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Impressions", value: report ? formatNumber(report.totals.impressions) : "—" },
          { label: "Clicks", value: report ? formatNumber(report.totals.clicks) : "—" },
          { label: "Click-through rate", value: report ? `${report.totals.ctr.toFixed(2)}%` : "—" },
        ].map((tile) => (
          <Card key={tile.label}>
            <div className="px-6 py-5">
              <p className="text-sm text-gray-500">{tile.label}</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white mt-1">{isFetching ? "…" : tile.value}</p>
            </div>
          </Card>
        ))}
      </div>

      <Card title="Daily">
        <div className="px-4 py-4">
          {report && report.daily.length > 0 ? (
            <Chart options={chartOptions} series={chartSeries} type="line" height={320} />
          ) : (
            <p className="text-sm text-gray-500 px-2 py-8 text-center">{isFetching ? "Loading..." : "No data"}</p>
          )}
        </div>
      </Card>

      <MetricsTable
        title="By campaign"
        isLoading={isFetching}
        rows={(report?.byCampaign ?? []).map((c) => ({ ...c, key: c.campaignId, label: c.campaignName, sublabel: c.advertiserName }))}
      />
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <MetricsTable
          title="By placement"
          isLoading={isFetching}
          rows={(report?.byPlacement ?? []).map((p) => ({ ...p, key: p.placementId, label: p.placementName, sublabel: p.placementKey }))}
        />
        <MetricsTable
          title="By ad"
          isLoading={isFetching}
          rows={(report?.byCreative ?? []).map((c) => ({ ...c, key: c.creativeId, label: c.creativeName, sublabel: c.size }))}
        />
      </div>
    </div>
  );
};

export default Reports;
