import { FC } from "react";

import { useIdApprovalDetailLogic } from "@/services/hooks/useIdApprovalDetailLogic";
import { IdApprovalDetailResponse } from "@/services/types/idApproval";

import { ActivityLogs, Profile, SecurityQuestions, Actions } from ".";

interface Props {
  data: IdApprovalDetailResponse;
}

const DetailWrapper: FC<Props> = ({ data }) => {
  const {
    activityLogs,
    profile,
    securityQuestions,
    isLocked,
    isLoading,
    isUnlocked,
    displayReview,
    isPendingStatus,
    isStatusUpdated,
    onUnlockAccount,
    onToggleReview,
    onUpdateStatus,
  } = useIdApprovalDetailLogic(data);

  return (
    <div className="grid grid-cols-1 px-4 pt-6 xl:grid-cols-3 xl:gap-6">
      <div className="col-span-full xl:col-auto">
        <Profile profile={profile} />
      </div>
      <div className="col-span-2 space-y-6">
        <ActivityLogs activityLogs={activityLogs} />
        <SecurityQuestions securityQuestions={securityQuestions} />
        <Actions
          profile={profile}
          isLocked={isLocked}
          isLoading={isLoading}
          isUnlocked={isUnlocked}
          displayReview={displayReview}
          isPendingStatus={isPendingStatus}
          isStatusUpdated={isStatusUpdated}
          onUnlockAccount={onUnlockAccount}
          onToggleReview={onToggleReview}
          onUpdateStatus={onUpdateStatus}
        />
      </div>
    </div>
  );
};

export default DetailWrapper;
