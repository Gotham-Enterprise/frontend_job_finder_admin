"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ExternalLink } from "lucide-react";
import Button from "@/components/ui/button/Button";
import ErrorState from "@/components/common/ErrorState";
import AssignLandlordModal from "./AssignLandlordModal";
import EditIngestRecordModal from "./EditIngestRecordModal";
import { useIngestRecord } from "@/services/hooks/useOfficeSpaceIngest";
import { IngestRecord } from "@/services/types/officeSpaceIngest";

const Field: React.FC<{ label: string; value: React.ReactNode }> = ({
  label,
  value,
}) => (
  <div>
    <dt className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
      {label}
    </dt>
    <dd className="mt-1 text-sm text-gray-800 dark:text-gray-200">{value}</dd>
  </div>
);

const orDash = (value: string | number | null | undefined) =>
  value === null || value === undefined || value === "" ? "—" : value;

const IngestRecordDetail: React.FC<{ id: string }> = ({ id }) => {
  const { data, isLoading, error, refetch } = useIngestRecord(id);
  const [assignOpen, setAssignOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  if (error) {
    return (
      <ErrorState
        message={`Error loading record: ${(error as Error).message}`}
        onRetry={() => refetch()}
      />
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-500" />
      </div>
    );
  }

  const record = data?.data;
  if (!record) {
    return <ErrorState message="This ingest record no longer exists." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <Link href="/admin/office-space-ingest">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4" />
            Back to records
          </Button>
        </Link>
        <div className="ml-auto flex gap-2">
          <Button variant="secondary" size="sm" onClick={() => setEditOpen(true)}>
            Edit
          </Button>
          <Button size="sm" onClick={() => setAssignOpen(true)}>
            Assign landlord
          </Button>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          {record.address1 || "Untitled listing"}
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {record.address2 || "No location on record"}
        </p>

        <a
          href={record.url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex items-center gap-1.5 text-sm text-blue-600 hover:underline dark:text-blue-400"
        >
          {record.url}
          <ExternalLink className="h-3.5 w-3.5" />
        </a>

        <dl className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="Square feet" value={orDash(record.squareFeet)} />
          <Field label="Price" value={orDash(record.priceText)} />
          <Field label="Year built" value={orDash(record.yearBuilt)} />
          <Field label="Property type" value={orDash(record.propertyTypeHint)} />
          <Field label="Space available" value={orDash(record.spaceAvailable)} />
          <Field label="Contact" value={orDash(record.contact)} />
          <Field
            label="Landlord"
            value={orDash(record.landlord?.businessName)}
          />
          <Field
            label="Last seen"
            value={new Date(record.lastSeenAt).toLocaleString()}
          />
        </dl>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
        <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">
          Raw scraped data
        </h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Preserved exactly as the source supplied it.
        </p>

        <dl className="mt-5 grid gap-5">
          <Field
            label="Details"
            value={
              <span className="whitespace-pre-wrap font-mono text-xs">
                {orDash(record.details)}
              </span>
            }
          />
          <Field
            label="Description"
            value={
              <span className="whitespace-pre-wrap">{orDash(record.description)}</span>
            }
          />
        </dl>
      </div>

      <AssignLandlordModal
        isOpen={assignOpen}
        recordIds={[record.id]}
        onClose={() => setAssignOpen(false)}
      />

      <EditIngestRecordModal
        isOpen={editOpen}
        record={record as IngestRecord}
        onClose={() => setEditOpen(false)}
      />
    </div>
  );
};

export default IngestRecordDetail;