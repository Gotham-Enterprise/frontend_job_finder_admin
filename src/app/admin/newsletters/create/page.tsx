"use client";
import React from "react";
import { useRouter } from "next/navigation";
import NewsletterForm, {
  NewsletterFormValues,
} from "@/components/admin/newsletter/NewsletterForm";
import {
  useCreateNewsletter,
  useSendNewsletterNow,
  useScheduleNewsletter,
} from "@/services/hooks/useNewsletter";
import { showToast } from "@/services/utils/toast";

export default function CreateNewsletterPage() {
  const router = useRouter();
  const createMutation = useCreateNewsletter();
  const sendNowMutation = useSendNewsletterNow();
  const scheduleMutation = useScheduleNewsletter();

  const isSubmitting =
    createMutation.isPending ||
    sendNowMutation.isPending ||
    scheduleMutation.isPending;

  const handleSubmit = async (values: NewsletterFormValues) => {
    try {
      const { sendMode, scheduledAt, filters, builderBlocks, showHeader, showFooter, ...rest } = values;

      const response = await createMutation.mutateAsync({
        ...rest,
        filters: {
          ...(filters.country ? { country: filters.country } : {}),
          ...(filters.state ? { state: filters.state } : {}),
        },
        builderBlocks,
        showHeader,
        showFooter,
      });

      const newsletterId = response.data.id;

      if (sendMode === "send") {
        await sendNowMutation.mutateAsync(newsletterId);
        showToast.success("Sending", "Newsletter is being sent to recipients");
        router.push(`/admin/newsletters/${newsletterId}`);
      } else if (sendMode === "schedule") {
        await scheduleMutation.mutateAsync({
          id: newsletterId,
          scheduledAt: new Date(scheduledAt).toISOString(),
        });
        router.push("/admin/newsletters");
      } else {
        showToast.success("Saved", "Newsletter saved as draft");
        router.push("/admin/newsletters");
      }
    } catch (error: any) {
      showToast.error(
        "Error",
        error?.message || "Something went wrong. Please try again."
      );
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Create Newsletter
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Compose a new email newsletter to send to your users
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <NewsletterForm
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />
      </div>
    </div>
  );
}
