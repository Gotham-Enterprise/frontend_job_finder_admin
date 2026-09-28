import React from "react";
import PermissionGuard from "@/components/guards/PermissionGuard";
import MedicalLibraryScraperRuns from "@/components/page/MedicalLibraryScraper";

export default function MedicalLibraryScraperRunsPage() {
  return (
    <PermissionGuard module="medicalLibrary" action="view">
      <MedicalLibraryScraperRuns />
    </PermissionGuard>
  );
}
