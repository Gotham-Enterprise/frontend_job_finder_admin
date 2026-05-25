import React, { Suspense } from "react";
import Supervisors from "@/components/page/Supervisor";
import FullScreenSpinner from "@/components/ui/FullScreenSpinner";

function SupervisorsContent() {
  return <Supervisors />;
}

const SupervisorsPage: React.FC = () => {
  return (
    <Suspense fallback={<FullScreenSpinner isVisible={true} message="Loading supervisors..." />}>
      <SupervisorsContent />
    </Suspense>
  );
};

export default SupervisorsPage;
