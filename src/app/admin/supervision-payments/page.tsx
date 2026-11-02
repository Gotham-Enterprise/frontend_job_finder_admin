import React, { Suspense } from "react";
import SupervisionPaymentsTabs from "@/components/page/SupervisionPaymentsTabs";
import FullScreenSpinner from "@/components/ui/FullScreenSpinner";

const SupervisionPaymentsPage: React.FC = () => {
  return (
    <Suspense fallback={<FullScreenSpinner isVisible={true} message="Loading payments..." />}>
      <SupervisionPaymentsTabs />
    </Suspense>
  );
};

export default SupervisionPaymentsPage;
