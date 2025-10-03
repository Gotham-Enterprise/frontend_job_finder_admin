"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/store";
import NewsletterSteps from "./components/NewsletterSteps";
import TemplateSelection from "./steps/TemplateSelection";
import EditStep from "./steps/EditStep";
import InboxStep from "./steps/InboxStep";
import SendToStep from "./steps/SendToStep";
import ScheduleStep from "./steps/ScheduleStep";

const NewsletterCreator: React.FC = () => {
  const router = useRouter();
  const currentStep = useAppSelector((state) => state.newsletter.currentStep);
  const [isClient, setIsClient] = useState(false);

  // Ensure component only fully renders on client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  const renderCurrentStep = () => {
    // During SSR or before hydration, always show Step 1
    if (!isClient) {
      return null;
    }

    switch (currentStep) {
      case 1:
        return <TemplateSelection />;
      case 2:
        return <EditStep />;
      case 3:
        return <InboxStep />;
      case 4:
        return <SendToStep />;
      case 5:
        return <ScheduleStep />;
      default:
        return <TemplateSelection />;
    }
  };

  // Show loading state during hydration
  if (!isClient) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading newsletter creator...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="mx-auto">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Create Newsletter</h1>
              </div>
              <button
                onClick={() => router.push("/admin/news-letter")}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Newsletter
              </button>
            </div>
          </div>

          {/* Steps Navigation */}
          <NewsletterSteps />
        </div>
      </div>

      {/* Main Content */}
      <main>{renderCurrentStep()}</main>
    </div>
  );
};

export default NewsletterCreator;
