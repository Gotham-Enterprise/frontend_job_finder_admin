import React, { Suspense } from "react";
import FullScreenSpinner from "@/components/ui/FullScreenSpinner";
import IngestRecordDetail from "@/components/page/OfficeSpaceIngest/IngestRecordDetail";

interface IngestRecordPageProps {
  params: Promise<{ id: string }>;
}

export default async function IngestRecordPage({ params }: IngestRecordPageProps) {
  const { id } = await params;

  return (
    <Suspense
      fallback={
        <FullScreenSpinner isVisible={true} message="Loading record..." />
      }
    >
      <IngestRecordDetail id={id} />
    </Suspense>
  );
}