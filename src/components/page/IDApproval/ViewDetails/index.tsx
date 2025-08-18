"use client";

import { FC } from "react";

import { ErrorState } from "@/components/common";
import BackToListButton from "@/components/ui/BackToListButton";
import FullScreenSpinner from "@/components/ui/FullScreenSpinner";
import { useGetIdApprovalDetails } from "@/services/hooks/useIdApproval";

import { DetailWrapper } from "./components";

interface Props {
  id: string;
}

const ViewDetails: FC<Props> = ({ id }) => {
  const { data, isLoading, error } = useGetIdApprovalDetails(id);

  if (isLoading) {
    return <FullScreenSpinner isVisible={true} message="Loading unlock request details..." />;
  }

  if (error) {
    return (
      <div className="px-4 pt-4 pb-2">
        <BackToListButton href="/admin/unlock-requests" className="mb-6" preserveState={true}>
          Back to Unlock Requests
        </BackToListButton>
        <ErrorState message={`Error loading unlock request details: ${error.message}`} />
      </div>
    );
  }

  return (
    <>
      <div className="px-4 pt-4 pb-2">
        <BackToListButton href="/admin/unlock-requests" preserveState={true}>
          Back to Unlock Requests
        </BackToListButton>
      </div>
      {data && <DetailWrapper data={data} />}
    </>
  );
};

export default ViewDetails;
