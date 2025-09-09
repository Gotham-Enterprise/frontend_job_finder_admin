import React, { Suspense } from "react";

import IDApproval from "@/components/page/IDApproval";
import FullScreenSpinner from "@/components/ui/FullScreenSpinner";

const IDApprovalPage = () => {
  return (
    <Suspense fallback={<FullScreenSpinner isVisible={true} message="Loading unlock requests..." />}>
      <IDApproval />
    </Suspense>
  );
};

export default IDApprovalPage;
