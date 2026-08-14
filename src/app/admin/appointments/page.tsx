import React, { Suspense } from "react";

import Appointments from "@/components/page/Appointments";
import FullScreenSpinner from "@/components/ui/FullScreenSpinner";

const AppointmentsPage = () => {
  return (
    <Suspense fallback={<FullScreenSpinner isVisible={true} message="Loading appointments..." />}>
      <Appointments />
    </Suspense>
  );
};

export default AppointmentsPage;
