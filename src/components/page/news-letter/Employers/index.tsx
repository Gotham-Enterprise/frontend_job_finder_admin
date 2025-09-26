"use client";

import React, { useState, useRef } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Modal } from "@/components/ui/modal";
import AllEmailsNewsletters from "./AllEmails";
import ArchivedNewsletters from "./Archived";
import DraftsNewsletters from "./Drafts";
import SentNewsletters from "./Sent";

export default function EmployersNewsletters() {
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);

  const handleFiles = (files: FileList | null) => {
    if (files && files.length) {
      setSelectedFileName(files[0].name);
    }
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
  };

  const onDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    handleFiles(e.dataTransfer.files);
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Employers News Letter</h1>
        <div className="flex gap-4">
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="px-4 py-1 border-primary border transparent text-primary rounded-sm"
          >
            Import Emails
          </button>
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

      <Modal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        isFullscreen={false}
        className="w-xl max-w-5xl mx-auto mt-20"
      >
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4">Import Emails</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Upload a CSV or Excel file containing email addresses to add to this mailing list. We'll validate and
            deduplicate addresses automatically and skip invalid rows. Imported addresses will be added to this audience
            for future newsletter sends.
          </p>

          <div
            onDragEnter={onDrag}
            onDragOver={onDrag}
            onDragLeave={onDrag}
            onDrop={onDrop}
            className={`w-full p-8 rounded border-2 border-dashed ${
              dragActive ? "border-primary bg-primary/5" : "border-gray-300 bg-gray-50"
            } dark:border-gray-600 dark:bg-gray-900 text-center mb-4`}
            role="button"
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="flex flex-col items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-gray-500 mb-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16v-4a4 4 0 118 0v4" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 12v9" />
              </svg>

              <p className="text-sm text-gray-600 dark:text-gray-400">
                Drag and drop a CSV, XLS, or XLSX file here to upload
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 my-2">or</p>
              <button
                type="button"
                className="text-primary underline font-medium"
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
              >
                Choose a file
              </button>

              {selectedFileName && <p className="text-sm text-gray-700 dark:text-gray-300 mt-3">{selectedFileName}</p>}
            </div>
          </div>

          <input ref={fileInputRef} type="file" accept=".csv,.xlsx,.xls" onChange={onFileChange} className="hidden" />

          <div className="flex justify-end gap-4">
            <button
              onClick={() => setIsImportModalOpen(false)}
              className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90">Import</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
