"use client";
import React from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import NewsletterForm, {
  NewsletterFormValues,
  SendMode,
} from "@/components/admin/newsletter/NewsletterForm";
import {
  useNewsletter,
  useUpdateNewsletter,
  useSendNewsletterNow,
  useScheduleNewsletter,
} from "@/services/hooks/useNewsletter";
import { showToast } from "@/services/utils/toast";

export default function EditNewsletterPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = params.id as string;

  const defaultAction = searchParams.get("action");
  const defaultSendMode: SendMode =
    defaultAction === "schedule" ? "schedule" : "draft";

  const { data, isLoading } = useNewsletter(id);
  const updateMutation = useUpdateNewsletter();
  const sendNowMutation = useSendNewsletterNow();
  const scheduleMutation = useScheduleNewsletter();

  const isSubmitting =
    updateMutation.isPending ||
    sendNowMutation.isPending ||
    scheduleMutation.isPending;

  const newsletter = data?.data;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500" />
      </div>
    );
  }

  if (!newsletter) {
    return (
      <div className="p-6 text-center text-gray-500 dark:text-gray-400">
        Newsletter not found
      </div>
    );
  }

  if (newsletter.status !== "draft") {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-600 dark:text-gray-400">
          Only draft newsletters can be edited.
        </p>
        <button
          onClick={() => router.push("/admin/newsletters")}
          className="mt-4 text-brand-500 hover:underline text-sm"
        >
          ← Back to Newsletters
        </button>
      </div>
    );
  }

  const handleSubmit = async (values: NewsletterFormValues) => {
    try {
      const { sendMode, scheduledAt, builderBlocks, listIds, showHeader, showFooter, ...rest } = values;

      await updateMutation.mutateAsync({
        id,
        data: {
          ...rest,
          builderBlocks,
          listIds: listIds.length > 0 ? listIds : [],
          showHeader,
          showFooter,
        },
      });

      if (sendMode === "send") {
        await sendNowMutation.mutateAsync(id);
        showToast.success("Sending", "Newsletter is being sent to recipients");
        router.push(`/admin/newsletters/${id}`);
      } else if (sendMode === "schedule") {
        await scheduleMutation.mutateAsync({
          id,
          scheduledAt: new Date(scheduledAt).toISOString(),
        });
        showToast.success("Scheduled", "Newsletter has been scheduled");
        router.push("/admin/newsletters");
      } else {
        showToast.success("Saved", "Newsletter updated successfully");
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
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Edit Newsletter
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Update your draft newsletter
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <NewsletterForm
          initialValues={newsletter}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          defaultSendMode={defaultSendMode}
        />
      </div>
    </div>
  );
}
