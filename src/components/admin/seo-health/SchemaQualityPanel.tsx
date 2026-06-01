"use client";

import { useRouter } from "next/navigation";
import Badge from "@/components/ui/badge/Badge";

interface SchemaQualityPanelProps {
  missingHiringOrg: number;
  missingEmploymentType: number;
  missingLocation: number;
  remoteMissingSchema: number;
  expiredButActive: number;
  totalActive: number;
}

interface SchemaRow {
  label: string;
  count: number;
  severity: "error" | "warning" | "info";
  description: string;
}

export default function SchemaQualityPanel({
  missingHiringOrg,
  missingEmploymentType,
  missingLocation,
  remoteMissingSchema,
  expiredButActive,
  totalActive,
}: SchemaQualityPanelProps) {
  const router = useRouter();
  const rows: SchemaRow[] = [
    {
      label: "Missing hiringOrganization.name",
      count: missingHiringOrg,
      severity: missingHiringOrg > 0 ? "error" : "info",
      description: "Jobs without company name",
    },
    {
      label: "Missing employmentType",
      count: missingEmploymentType,
      severity: missingEmploymentType > 100 ? "warning" : "info",
      description: "Jobs without work type",
    },
    {
      label: "Missing jobLocation",
      count: missingLocation,
      severity: missingLocation > 0 ? "error" : "info",
      description: "Jobs without city & state",
    },
    {
      label: "Remote missing TELECOMMUTE",
      count: remoteMissingSchema,
      severity: "info",
      description: "Remote jobs (need TELECOMMUTE schema)",
    },
    {
      label: "Expired Jobs",
      count: expiredButActive,
      severity: expiredButActive > 0 ? "warning" : "info",
      description: "Jobs that are already expired",
    },
  ];

  const badgeColor = (severity: string) => {
    switch (severity) {
      case "error":
        return "error";
      case "warning":
        return "warning";
      default:
        return "info";
    }
  };

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
      <div className="px-6 py-4">
        <h3 className="text-base font-medium text-gray-800 dark:text-white/90">
          Schema Quality Indicators
        </h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Based on {totalActive.toLocaleString()} active jobs
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-t border-gray-100 bg-gray-50 dark:border-gray-700 dark:bg-gray-900">
              <th className="px-6 py-3 font-medium text-gray-500 dark:text-gray-400">
                Schema Field
              </th>
              <th className="px-6 py-3 font-medium text-gray-500 dark:text-gray-400">
                Missing
              </th>
              <th className="px-6 py-3 font-medium text-gray-500 dark:text-gray-400">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {rows.map((row) => {
              const isExpiredRow =
                row.label === "Expired Jobs" && row.count > 0;
              return (
                <tr
                  key={row.label}
                  onClick={
                    isExpiredRow
                      ? () => router.push("/admin/seo-health/expired-jobs")
                      : undefined
                  }
                  onKeyDown={
                    isExpiredRow
                      ? (e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            router.push("/admin/seo-health/expired-jobs");
                          }
                        }
                      : undefined
                  }
                  tabIndex={isExpiredRow ? 0 : undefined}
                  role={isExpiredRow ? "link" : undefined}
                  className={`hover:bg-gray-50 dark:hover:bg-gray-700/50 ${isExpiredRow
                      ? "cursor-pointer"
                      : ""
                    }`}
                >
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {row.label}
                      </p>
                      <p className="mt-0.5 text-xs text-gray-500">
                        {row.description}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                    {row.count.toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant="light" color={badgeColor(row.severity)}>
                      {row.count === 0
                        ? "OK"
                        : row.severity === "error"
                          ? "Critical"
                          : row.severity === "warning"
                            ? "Warning"
                            : "Info"}
                    </Badge>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
