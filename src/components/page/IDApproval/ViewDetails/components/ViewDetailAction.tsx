import { FC } from "react";

import { UseIdApprovalDetailLogic } from "@/services/types/idApproval";

import ViewDetailActionReview from "./ViewDetailActionReview";
import ViewDetailActionUnlock from "./ViewDetailActionUnlock";

interface Props {
  isLocked: UseIdApprovalDetailLogic["isLocked"];
  isLoading: UseIdApprovalDetailLogic["isLoading"];
  isUnlocked: UseIdApprovalDetailLogic["isUnlocked"];
  displayReview: UseIdApprovalDetailLogic["displayReview"];
  profile: UseIdApprovalDetailLogic["profile"];
  isPendingStatus: UseIdApprovalDetailLogic["isPendingStatus"];
  isStatusUpdated: UseIdApprovalDetailLogic["isStatusUpdated"];
  onUnlockAccount: UseIdApprovalDetailLogic["onUnlockAccount"];
  onToggleReview: UseIdApprovalDetailLogic["onToggleReview"];
  onUpdateStatus: UseIdApprovalDetailLogic["onUpdateStatus"];
}

const ViewDetailAction: FC<Props> = ({
  isLocked,
  isLoading,
  isUnlocked,
  displayReview,
  profile,
  isPendingStatus,
  isStatusUpdated,
  onUnlockAccount,
  onToggleReview,
  onUpdateStatus,
}) => {
  return (
    <>
      <div className="flex flex-row-reverse justify-start gap-4">
        <ViewDetailActionReview
          isLocked={isLocked}
          isLoading={isLoading}
          profile={profile}
          displayReview={displayReview}
          isPendingStatus={isPendingStatus}
          isStatusUpdated={isStatusUpdated}
          onToggleReview={onToggleReview}
          onUnlockAccount={onUnlockAccount}
          onUpdateStatus={onUpdateStatus}
        />
        <ViewDetailActionUnlock
          isLocked={isLocked}
          isLoading={isLoading}
          isUnlocked={isUnlocked}
          onUnlockAccount={onUnlockAccount}
        />
      </div>
    </>
  );
};

export default ViewDetailAction;
