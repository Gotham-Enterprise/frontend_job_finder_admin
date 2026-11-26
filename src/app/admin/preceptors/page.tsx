import React, { Suspense } from "react";
import Supervisors from "@/components/page/Supervisor";
import FullScreenSpinner from "@/components/ui/FullScreenSpinner";

const PreceptorsPage: React.FC = () => {
  return (
    <Suspense fallback={<FullScreenSpinner isVisible={true} message="Loading preceptors..." />}>
      <Supervisors variant="preceptors" />
    </Suspense>
  );
};

export default PreceptorsPage;
