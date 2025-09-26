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
      <h1 className="text-2xl font-bold mb-6">Job Seekers News Letter</h1>

      <Tabs defaultValue="all-emails" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all-emails">All Emails</TabsTrigger>
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
