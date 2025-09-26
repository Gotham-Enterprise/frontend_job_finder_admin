"use client";

import React from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import AllEmailsNewsletters from "./AllEmails";
import ArchivedNewsletters from "./Archived";
import DraftsNewsletters from "./Drafts";
import SentNewsletters from "./Sent";

export default function JobSeekersNewsletters() {
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Job Seekers News Letter</h1>
        <div className="flex gap-4">
          <button className="px-4 py-1 border-primary border transparent text-primary rounded-sm">Import Emails</button>
          <button className="px-4 py-1 bg-primary text-white rounded-sm">Create New Newsletter</button>
        </div>
      </div>
      <Tabs defaultValue="all-emails" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all-emails">News Letter</TabsTrigger>
          <TabsTrigger value="sent">Sent</TabsTrigger>
          <TabsTrigger value="drafts">Drafts</TabsTrigger>
          <TabsTrigger value="archived">Archived</TabsTrigger>
        </TabsList>

        <TabsContent value="all-emails">
          <AllEmailsNewsletters />
        </TabsContent>

        <TabsContent value="sent">
          <SentNewsletters />
        </TabsContent>

        <TabsContent value="drafts">
          <DraftsNewsletters />
        </TabsContent>

        <TabsContent value="archived">
          <ArchivedNewsletters />
        </TabsContent>
      </Tabs>
    </div>
  );
}
