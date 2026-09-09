import { FC } from "react";

import Avatar from "@/components/ui/avatar/Avatar";
import { DocumentVerificationDetailResponse } from "@/services/types/documentVerification";

interface Props {
  candidate: DocumentVerificationDetailResponse["data"]["candidate"];
}

const ViewDetailCandidateInfo: FC<Props> = ({ candidate }) => {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="flex flex-col items-center gap-3 text-center">
        <Avatar alt={candidate.name} name={candidate.name} size="xlarge" className="rounded-full" />
        <div>
          <h2 className="text-gray-900 dark:text-white text-lg font-semibold">{candidate.name}</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">{candidate.email}</p>
        </div>
      </div>
    </div>
  );
};

export default ViewDetailCandidateInfo;
