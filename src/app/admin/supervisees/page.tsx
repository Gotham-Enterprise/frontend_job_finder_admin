import React, { Suspense } from "react";
import Supervisees from "@/components/page/Supervisee";
import FullScreenSpinner from "@/components/ui/FullScreenSpinner";

function SuperviseesContent() {
  return <Supervisees />;
}

const SuperviseesPage: React.FC = () => {
  return (
    <Suspense fallback={<FullScreenSpinner isVisible={true} message="Loading supervisees..." />}>
      <SuperviseesContent />
    </Suspense>
  );
};

export default SuperviseesPage;
