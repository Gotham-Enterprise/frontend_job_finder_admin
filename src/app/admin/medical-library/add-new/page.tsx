"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { MedicalLibraryForm } from "@/components/page/MedicalLibrary/components";
import { useCreateMedicalLibraryTopic } from "@/services/hooks/useMedicalLibrary";
import { showToast } from "@/services/utils/toast";

export default function AddNewMedicalLibraryTopic() {
  const router = useRouter();
  const { mutate: createTopic, isPending } = useCreateMedicalLibraryTopic();

  const handleSave = (payload: any, onDone: () => void) => {
    createTopic(payload, {
      onSuccess: () => {
        showToast.success("Success", "Medical Library topic created successfully.");
        onDone();
        router.push("/admin/medical-library");
      },
      onError: (error: any) => {
        showToast.error("Error", error?.message || "Failed to create topic.");
        onDone();
      },
    });
  };

  return (
    <div className="p-8">
      <MedicalLibraryForm onSave={handleSave} isSaving={isPending} />
    </div>
  );
}
