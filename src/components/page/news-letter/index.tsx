"use client";
import React, { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useToast } from "@/context/ToastContext";
import { useAppDispatch } from "@/store";
import { resetNewsletter } from "@/store/slices/newsletterSlice";
import { NewsLetterTab, SentTab, DraftsTab, ArchivedTab } from "./components/tab";
import BulkActionDropdown from "@/components/ui/BulkActionDropdown";

const NewsLetterComponent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addToast } = useToast();
  const dispatch = useAppDispatch();
  const [activeTab, setActiveTab] = useState("newsletter");
  const [refreshKey, setRefreshKey] = useState(0);
  const toastShownRef = useRef(false);

  // Bulk actions state for NewsLetterTab
  const [selectedNewsletters, setSelectedNewsletters] = useState<string[]>([]);
  const [selectedNewslettersData, setSelectedNewslettersData] = useState<any[]>([]);
  const [bulkActionHandlers, setBulkActionHandlers] = useState<{
    onBulkPublish?: () => void;
    onBulkDelete?: () => void;
    onBulkSchedule?: () => void;
    isBulkActionLoading?: boolean;
  }>({});

  useEffect(() => {
    // Check if we were redirected with a success parameter
    const success = searchParams.get("success");
    if (success === "created" && !toastShownRef.current) {
      toastShownRef.current = true;
      addToast({
        variant: "success",
        title: "Success",
        message: "Newsletter created successfully!",
      });

      // Trigger refresh of the newsletter list
      setRefreshKey((prev) => prev + 1);

      // Remove the success parameter from URL to prevent showing toast on refresh
      router.replace("/admin/news-letter", { scroll: false });
    }
  }, [searchParams, addToast, router]);

  const tabs = [
    { id: "newsletter", label: "News Letter", component: NewsLetterTab },
    { id: "sent", label: "Sent", component: SentTab },
    { id: "drafts", label: "Drafts", component: DraftsTab },
    { id: "archived", label: "Archived", component: ArchivedTab },
  ];

  // Clear selections when switching tabs
  useEffect(() => {
    setSelectedNewsletters([]);
  }, [activeTab]);

  const handleCreateNewsletter = () => {
    dispatch(resetNewsletter());
    router.push("/admin/news-letter/create");
  };

  const renderTabContent = () => {
    const activeTabData = tabs.find((tab) => tab.id === activeTab);
    if (activeTabData) {
      const Component = activeTabData.component;

      // Pass props to NewsLetterTab for bulk actions
      if (activeTab === "newsletter") {
        return (
          <Component
            key={refreshKey}
            selectedNewsletters={selectedNewsletters}
            setSelectedNewsletters={setSelectedNewsletters}
            setBulkActionHandlers={setBulkActionHandlers}
            setSelectedNewslettersData={setSelectedNewslettersData}
          />
        );
      }

      return <Component key={activeTab} />;
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <div className="mx-auto">
        {/* Newsletter Categories */}
        <div className="bg-white shadow rounded-lg mb-8">
          <div className="flex justify-between items-center mx-auto px-4 pb-5 pt-5 sm:px-6 lg:px-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">News Letter Management</h1>
              <p className="mt-2 text-gray-600">Create, manage, and send news letter to your audience</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCreateNewsletter}
                className="flex items-center gap-2 px-4 py-3 text-sm font-medium rounded-sm border bg-white border-gray-200 text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span className="whitespace-nowrap">Create News Letter</span>
              </button>
              {activeTab === "newsletter" && selectedNewsletters.length > 0 && (() => {
                // Check statuses of selected newsletters
                const hasSent = selectedNewslettersData.some((n: any) => n.status === "SENT");
                const allDraft = selectedNewslettersData.every((n: any) => n.status === "DRAFT");

                return (
                  <BulkActionDropdown
                    selectedItems={selectedNewsletters}
                    itemType="newsletters"
                    onBulkDelete={bulkActionHandlers.onBulkDelete || (() => {})}
                    onBulkPublish={!hasSent ? bulkActionHandlers.onBulkPublish : undefined}
                    onBulkSchedule={allDraft ? bulkActionHandlers.onBulkSchedule : undefined}
                    onClearSelection={() => setSelectedNewsletters([])}
                    isDeleting={bulkActionHandlers.isBulkActionLoading}
                    isUpdatingStatus={bulkActionHandlers.isBulkActionLoading}
                    permissions={{
                      create: true,
                      update: true,
                      delete: true,
                    }}
                  />
                );
              })()}
            </div>
          </div>
          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="py-6">
            <div className="mb-6">{renderTabContent()}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewsLetterComponent;
