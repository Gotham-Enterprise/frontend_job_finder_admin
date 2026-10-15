import React, { Suspense } from "react";
import SupervisionPayments from "@/components/page/SupervisionPayments";
import FullScreenSpinner from "@/components/ui/FullScreenSpinner";

const SupervisionPaymentsPage: React.FC = () => {
  return (
    <Suspense fallback={<FullScreenSpinner isVisible={true} message="Loading payments..." />}>
      <SupervisionPayments />
    </Suspense>
  );
};

export default SupervisionPaymentsPage;
