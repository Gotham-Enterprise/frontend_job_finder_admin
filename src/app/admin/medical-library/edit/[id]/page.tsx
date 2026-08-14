"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { MedicalLibraryForm } from "@/components/page/MedicalLibrary/components";
import { useMedicalLibraryTopicById, useUpdateMedicalLibraryTopic } from "@/services/hooks/useMedicalLibrary";
import { showToast } from "@/services/utils/toast";
import FullScreenSpinner from "@/components/ui/FullScreenSpinner";
import ErrorState from "@/components/common/ErrorState";

export default function EditMedicalLibraryTopic() {
  const params = useParams();
  const router = useRouter();
  const topicId = params?.id as string;

  const { data: topicData, isLoading, error, refetch } = useMedicalLibraryTopicById(topicId);
  const { mutate: updateTopic, isPending } = useUpdateMedicalLibraryTopic();

  const handleSave = (payload: any, onDone: (apiErrorMessage?: string) => void) => {
    updateTopic(
      { id: topicId, data: payload },
      {
        onSuccess: () => {
          showToast.success("Success", "Medical Library topic updated successfully.");
          onDone();
          router.push("/admin/medical-library");
        },
        onError: (error: any) => {
          showToast.error("Error", error?.message || "Failed to update topic.");
          onDone(error?.message);
        },
      }
    );
  };

  if (isLoading) {
    return <FullScreenSpinner isVisible={true} message="Loading Topic Details..." />;
  }

  if (error) {
    return (
      <div className="p-8">
        <ErrorState message="Error fetching topic details" onRetry={refetch} />
      </div>
    );
  }

  return (
    <div className="p-8">
      <MedicalLibraryForm initialData={topicData?.data} onSave={handleSave} isSaving={isPending} />
    </div>
  );
}
