"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAppDispatch } from "@/store";
import {
  updateNewsletterData,
  setCurrentStep,
  setDesign,
  setContent,
  setEditMode,
} from "@/store/slices/newsletterSlice";
import { getNewsletterById } from "@/services/api/newsletterService";
import NewsletterSteps from "./components/NewsletterSteps";
import EditStep from "./steps/EditStep";

interface Newsletter {
  id: string;
  subject: string;
  fromName: string;
  fromAddress: string;
  sendTo: string[];
  dontSendTo: string[];
  status: "DRAFT" | "SCHEDULED" | "SENT" | "ARCHIVED";
  scheduledAt?: string;
  scheduledTimezone?: string;
  isTemplate: boolean;
  content: string;
  design?: any;
  createdAt: string;
  updatedAt: string;
}

const NewsletterEditor: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newsletter, setNewsletter] = useState<Newsletter | null>(null);

  const newsletterId = params?.id as string;

  const handleBackToList = () => {
    // Reset edit mode before navigating back
    dispatch(setEditMode({ isEditMode: false, newsletterId: null }));
    router.push("/admin/news-letter");
  };

  useEffect(() => {
    const fetchNewsletter = async () => {
      if (!newsletterId) {
        setError("Newsletter ID is missing");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const result = await getNewsletterById(newsletterId);
        const newsletterData = result.data;

        // Design is already parsed by the service
        setNewsletter(newsletterData);

        // Set edit mode
        dispatch(setEditMode({ isEditMode: true, newsletterId: newsletterId }));

        // Set newsletter data in Redux store
        dispatch(
          updateNewsletterData({
            subject: newsletterData.subject,
            fromName: newsletterData.fromName,
            fromAddress: newsletterData.fromAddress,
            sendTo: newsletterData.sendTo,
            dontSendTo: newsletterData.dontSendTo,
            status: newsletterData.status,
            scheduledAt: newsletterData.scheduledAt,
            scheduledTimezone: newsletterData.scheduledTimezone,
            isTemplate: newsletterData.isTemplate,
            content: newsletterData.content,
            design: newsletterData.design,
          })
        );

        // Set to Edit step (step 2)
        dispatch(setCurrentStep(2));

        setError(null);
      } catch (err) {
        console.error("Error fetching newsletter:", err);
        setError(err instanceof Error ? err.message : "Failed to load newsletter");
      } finally {
        setLoading(false);
      }
    };

    fetchNewsletter();
  }, [newsletterId, dispatch]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading newsletter...</p>
        </div>
      </div>
    );
  }

  if (error || !newsletter) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="mb-4">
            <svg className="mx-auto h-12 w-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to load newsletter</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={handleBackToList}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Back to Newsletter List
          </button>
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
                <h1 className="text-2xl font-bold text-gray-900">Edit Newsletter</h1>
                <p className="mt-1 text-sm text-gray-600">{newsletter.subject}</p>
              </div>
              <button
                onClick={handleBackToList}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Newsletter
              </button>
            </div>
          </div>

          {/* Steps Navigation - only showing Edit step */}
          <NewsletterSteps />
        </div>
      </div>

      {/* Main Content - Edit Step */}
      <main>
        <EditStep />
      </main>
    </div>
  );
};

export default NewsletterEditor;
