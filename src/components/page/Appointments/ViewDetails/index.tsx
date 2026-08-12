"use client";

import { FC } from "react";

import { ErrorState } from "@/components/common";
import BackToListButton from "@/components/ui/BackToListButton";
import FullScreenSpinner from "@/components/ui/FullScreenSpinner";
import { useGetAppointmentDetails } from "@/services/hooks/useAppointments";

import { DetailWrapper } from "./components";

interface Props {
  id: string;
}

const ViewDetails: FC<Props> = ({ id }) => {
  const { data, isLoading, error } = useGetAppointmentDetails(id);

  if (isLoading) {
    return <FullScreenSpinner isVisible={true} message="Loading appointment details..." />;
  }

  if (error) {
    return (
      <div className="px-4 pt-4 pb-2">
        <BackToListButton href="/admin/appointments" className="mb-6" preserveState={true}>
          Back to Appointments
        </BackToListButton>
        <ErrorState message={`Error loading appointment details: ${error.message}`} />
      </div>
    );
  }

  return (
    <>
      <div className="px-4 pt-4 pb-2">
        <BackToListButton href="/admin/appointments" preserveState={true}>
          Back to Appointments
        </BackToListButton>
      </div>
      {data && <DetailWrapper appointment={data.data} />}
    </>
  );
};

export default ViewDetails;
