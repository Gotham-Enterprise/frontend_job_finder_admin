"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Badge from "@/components/ui/badge/Badge";
import Button from "@/components/ui/button/Button";
import { formatLegalDocumentDateLabel } from "./formatLegalDocumentDate";
import { useLegalDocumentVersion } from "@/services/hooks/useLegalDocuments";
import {
  LEGAL_DOCUMENT_LABELS,
  LegalDocumentType,
} from "@/services/types/legalDocuments";

interface LegalDocumentVersionDetailProps {
  type: LegalDocumentType;
  id: number;
}

const LegalDocumentVersionDetail: React.FC<LegalDocumentVersionDetailProps> = ({
  type,
  id,
}) => {
  const router = useRouter();
  const labels = LEGAL_DOCUMENT_LABELS[type];
  const basePath = `/admin/legal/${type}`;

  const { data, isLoading, error } = useLegalDocumentVersion(type, id);
  const version = data?.data;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-brand-500" />
      </div>
    );
  }

  if (error || !version) {
    return (
      <div className="p-6">
        <p className="text-red-600">Version not found.</p>
        <Button className="mt-4" variant="outline" onClick={() => router.push(basePath)}>
          Back to list
        </Button>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <Link
          href={basePath}
          className="text-sm text-brand-500 hover:underline"
        >
          &larr; Back to {labels.title} versions
        </Link>
      </div>

      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            {labels.title} Version #{version.id}
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Created {formatLegalDocumentDateLabel(version.createdAt)}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {version.isLatest ? (
            <Badge color="success">Current (live)</Badge>
          ) : (
            <Badge color="primary">Archived</Badge>
          )}
          {typeof version.agreementCount === "number" && (
            <Badge color="info">{version.agreementCount} user agreement(s)</Badge>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
        <h2 className="mb-4 text-lg font-medium text-gray-900 dark:text-white">
          Content Preview
        </h2>
        <div
          className="prose max-w-none dark:prose-invert"
          dangerouslySetInnerHTML={{ __html: version.content }}
        />
      </div>
    </div>
  );
};

export default LegalDocumentVersionDetail;
