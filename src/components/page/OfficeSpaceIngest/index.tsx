"use client";

import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import IngestImportPanel from "./IngestImportPanel";
import IngestRecordsList from "./IngestRecordsList";
import IngestHistory from "./IngestHistory";

const OfficeSpaceIngest: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
          Office Space Ingest
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Import scraped listing data, review it, and link it to landlord profiles.
        </p>
      </div>

      <Tabs defaultValue="import" value={undefined}>
        <TabsList>
          <TabsTrigger value="import">Import</TabsTrigger>
          <TabsTrigger value="records">Records</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="import">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
            <IngestImportPanel />
          </div>
        </TabsContent>

        <TabsContent value="records">
          <IngestRecordsList />
        </TabsContent>

        <TabsContent value="history">
          <IngestHistory />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default OfficeSpaceIngest;