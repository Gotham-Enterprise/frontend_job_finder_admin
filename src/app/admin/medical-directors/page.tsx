import React, { Suspense } from "react";
import Supervisors from "@/components/page/Supervisor";
import FullScreenSpinner from "@/components/ui/FullScreenSpinner";

/** Supervisors whose primary type is Medical Director, on their own page. */
const MedicalDirectorsPage: React.FC = () => {
  return (
    <Suspense fallback={<FullScreenSpinner isVisible={true} message="Loading medical directors..." />}>
      <Supervisors mode="medicalDirectors" />
    </Suspense>
  );
};

export default MedicalDirectorsPage;
