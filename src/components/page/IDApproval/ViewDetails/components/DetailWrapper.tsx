import { FC } from "react";

import { IdApproval, IdApprovalDetailResponse } from "@/services/types/idApproval";
import { useIdApprovalDetailLogic } from "@/services/hooks/useIdApprovalDetailLogic";

import { Profile, ActivityLogs, SecurityQuestions } from "./";

interface Props {
  data: IdApprovalDetailResponse;
}

const DetailWrapper: FC<Props> = ({ data }) => {
  const { activityLogs, profile, securityQuestions } = useIdApprovalDetailLogic(data);

  return (
    <div className="grid grid-cols-1 px-4 pt-6 xl:grid-cols-3 xl:gap-6">
      <div className="col-span-full xl:col-auto">
        <Profile profile={profile} />
      </div>
      <div className="col-span-2 space-y-6">
        <ActivityLogs />
        <SecurityQuestions />
      </div>
    </div>
  );
};

export default DetailWrapper;
