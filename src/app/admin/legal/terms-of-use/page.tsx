import React, { Suspense } from "react";
import FullScreenSpinner from "@/components/ui/FullScreenSpinner";
import { LegalDocumentVersionList } from "@/components/page/LegalDocuments";

export default function TermsOfUseVersionsPage() {
  return (
    <Suspense
      fallback={
        <FullScreenSpinner isVisible={true} message="Loading terms of use versions..." />
      }
    >
      <LegalDocumentVersionList type="terms-of-use" />
    </Suspense>
  );
}
