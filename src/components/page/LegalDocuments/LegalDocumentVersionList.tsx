"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "@/components/ui/table";
import TableHeading from "@/components/tables/tableHeader";
import Badge from "@/components/ui/badge/Badge";
import Button from "@/components/ui/button/Button";
import { EyeIcon } from "@/icons";
import { LegalDocumentDateCell } from "./formatLegalDocumentDate";
import { useLegalDocumentVersions } from "@/services/hooks/useLegalDocuments";
import {
  LEGAL_DOCUMENT_LABELS,
  LegalDocumentType,
} from "@/services/types/legalDocuments";

const TABLE_COLUMNS = [
  { key: "id", label: "Version ID" },
  { key: "createdAt", label: "Created" },
  { key: "preview", label: "Preview" },
  { key: "status", label: "Status" },
  { key: "actions", label: "Actions" },
];

interface LegalDocumentVersionListProps {
  type: LegalDocumentType;
}

const LegalDocumentVersionList: React.FC<LegalDocumentVersionListProps> = ({ type }) => {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const labels = LEGAL_DOCUMENT_LABELS[type];

  const { data, isLoading, error, refetch } = useLegalDocumentVersions(type, {
    page,
    limit: 10,
    sortOrder: "desc",
  });

  const basePath = `/admin/legal/${type}`;

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            {labels.title} Versions
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            The site always displays the most recently created version.
          </p>
        </div>
        <Button onClick={() => router.push(`${basePath}/create`)}>
          Create New Version
        </Button>
      </div>

      <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-200">
        Versions are immutable. To update the {labels.singular}, create a new version.
        Existing user agreements remain linked to the version they accepted.
      </div>

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
          <p>Failed to load versions.</p>
          <Button className="mt-3" variant="outline" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
          <Table>
            <TableHeading columns={TABLE_COLUMNS} />
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell className="px-6 py-8 text-center" colSpan={5}>
                    <div className="flex items-center justify-center gap-3">
                      <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-brand-500" />
                      <p className="text-gray-500 dark:text-gray-400">Loading...</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : !data?.data?.length ? (
                <TableRow>
                  <TableCell className="px-6 py-8 text-center" colSpan={5}>
                    <p className="text-gray-500 dark:text-gray-400">No versions found.</p>
                    <Link
                      href={`${basePath}/create`}
                      className="mt-2 inline-block text-brand-500 hover:underline"
                    >
                      Create the first version
                    </Link>
                  </TableCell>
                </TableRow>
              ) : (
                data.data.map((version) => (
                  <TableRow
                    key={version.id}
                    className="border-b border-gray-200 text-sm hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800/50"
                  >
                    <TableCell className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                      #{version.id}
                    </TableCell>
                    <TableCell className="px-6 py-4 text-gray-600 dark:text-gray-300">
                      <LegalDocumentDateCell dateString={version.createdAt} />
                    </TableCell>
                    <TableCell className="max-w-md px-6 py-4 text-gray-600 dark:text-gray-300">
                      <p className="line-clamp-2">{version.contentPreview}</p>
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      {version.isLatest ? (
                        <Badge color="success">Current (live)</Badge>
                      ) : (
                        <Badge color="primary">Archived</Badge>
                      )}
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`${basePath}/${version.id}`)}
                        startIcon={<EyeIcon />}
                      >
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {data?.pagination && data.pagination.totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-gray-200 px-6 py-4 dark:border-gray-700">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Page {data.pagination.page} of {data.pagination.totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((current) => current - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= data.pagination.totalPages}
                  onClick={() => setPage((current) => current + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LegalDocumentVersionList;
