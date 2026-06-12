import React, { Suspense } from "react";
import FullScreenSpinner from "@/components/ui/FullScreenSpinner";
import { LegalDocumentVersionList } from "@/components/page/LegalDocuments";

export default function PrivacyPolicyVersionsPage() {
  return (
    <Suspense
      fallback={
        <FullScreenSpinner isVisible={true} message="Loading privacy policy versions..." />
      }
    >
      <LegalDocumentVersionList type="privacy-policy" />
    </Suspense>
  );
}
