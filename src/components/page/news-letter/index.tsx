"use client";
import React, { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useToast } from "@/context/ToastContext";
import { useAppDispatch } from "@/store";
import { resetNewsletter } from "@/store/slices/newsletterSlice";
import { NewsLetterTab, SentTab, DraftsTab, ArchivedTab } from "./components/tab";

const NewsLetterComponent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addToast } = useToast();
  const dispatch = useAppDispatch();
  const [activeTab, setActiveTab] = useState("newsletter");
  const [refreshKey, setRefreshKey] = useState(0);
  const toastShownRef = useRef(false);

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

  const handleCreateNewsletter = () => {
    dispatch(resetNewsletter());
    router.push("/admin/news-letter/create");
  };

  const renderTabContent = () => {
    const activeTabData = tabs.find((tab) => tab.id === activeTab);
    if (activeTabData) {
      const Component = activeTabData.component;
      return <Component key={activeTab === "newsletter" ? refreshKey : activeTab} />;
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
            <div className="flex space-x-3">
              <button
                onClick={handleCreateNewsletter}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary"
              >
                <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create News Letter
              </button>
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
