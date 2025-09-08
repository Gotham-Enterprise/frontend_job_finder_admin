import { FC } from "react";

import Avatar from "@/components/ui/avatar/Avatar";
import { UseIdApprovalDetailLogic } from "@/services/types/idApproval";
import { formatPhoneNumber, formatUSPhoneNumber } from "@/services/utils";

import AccountStatus from "../../components/AccountStatus";

interface Props {
  profile: UseIdApprovalDetailLogic["profile"];
}

const Profile: FC<Props> = ({ profile }) => {
  return (
    <div className="rounded-xl bg-white p-10 shadow-lg border border-gray-100 dark:bg-gray-800 dark:border-gray-700 h-full">
      <div className="flex flex-col gap-4">
        <div className="flex flex-row">
          <div className="flex items-center gap-3">
            <Avatar
              src={profile.picture || undefined}
              alt={profile.name}
              name={profile.name}
              size="xlarge"
              className="rounded-full"
            />
            <div className="flex flex-col">
              <p className="text-xl text-gray-900 dark:text-white font-semibold">{profile.name}</p>
              <AccountStatus isLocked={profile.isLocked} />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex flex-row">
            <div className="w-1/3">
              <p className="text-lg text-gray-400">Phone number:</p>
            </div>
            <div className="w-2/3">
              <p className="text-lg text-gray-900">{formatUSPhoneNumber(profile.phoneNumber)}</p>
            </div>
          </div>
          <div className="flex flex-row">
            <div className="w-1/3">
              <p className="text-lg text-gray-400">Email address:</p>
            </div>
            <div className="w-2/3">
              <p className="text-lg text-gray-900">{profile.email}</p>
            </div>
          </div>
          <div className="flex flex-row">
            <div className="w-1/3">
              <p className="text-lg text-gray-400">Address:</p>
            </div>
            <div className="w-2/3">
              <p className="text-lg text-gray-900">{profile.address}</p>
            </div>
          </div>
          <div className="flex flex-row">
            <div className="w-1/3">
              <p className="text-lg text-gray-400">Specialties:</p>
            </div>
            <div className="w-2/3">
              <p className="text-lg text-gray-900">{profile.specialty}</p>
            </div>
          </div>
          <div className="flex flex-row">
            <div className="w-1/3">
              <p className="text-lg text-gray-400">Degrees:</p>
            </div>
            <div className="w-2/3">
              <p className="text-lg text-gray-900">{profile.degree}</p>
            </div>
          </div>
          <div className="flex flex-row">
            <div className="w-1/3">
              <p className="text-lg text-gray-400">State Licenses:</p>
            </div>
            <div className="w-2/3">
              <p className="text-lg text-gray-900">{profile.licenses}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
