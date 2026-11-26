import React, { Suspense } from "react";
import Supervisees from "@/components/page/Supervisee";
import FullScreenSpinner from "@/components/ui/FullScreenSpinner";

const PrecepteesPage: React.FC = () => {
  return (
    <Suspense fallback={<FullScreenSpinner isVisible={true} message="Loading preceptees..." />}>
      <Supervisees variant="preceptees" />
    </Suspense>
  );
};

export default PrecepteesPage;
