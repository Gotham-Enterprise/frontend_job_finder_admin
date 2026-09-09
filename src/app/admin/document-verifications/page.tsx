import React, { Suspense } from "react";

import DocumentVerification from "@/components/page/DocumentVerification";
import FullScreenSpinner from "@/components/ui/FullScreenSpinner";

const DocumentVerificationPage = () => {
  return (
    <Suspense fallback={<FullScreenSpinner isVisible={true} message="Loading document verifications..." />}>
      <DocumentVerification />
    </Suspense>
  );
};

export default DocumentVerificationPage;
