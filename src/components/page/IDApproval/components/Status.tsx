import { FC } from 'react';

import { StatusApproved, StatusDeclined, StatusPending } from '@/icons';

interface Props {
  status: string;
}

const srcMap: Record<string, string> = {
  pending: '/images/icons/status-pending.svg',
  approved: '/images/icons/status-approved.svg',
  declined: '/images/icons/status-declined.svg',
};

const AccountStatus: FC<Props> = ({ status }) => {
  const renderIcon = () => {
    switch (status) {
      case 'pending':
        return <StatusPending />;
      case 'approved':
      case 'auto_approved':
        return <StatusApproved />;
      case 'declined':
        return <StatusDeclined />;
      default:
        return <StatusPending />;
    }
  };

  return (
    <div className="flex items-center gap-2">
      {renderIcon()}
      <span className="text-sm text-gray-900 dark:text-white capitalize">{status.replace(/_/g, ' ')}</span>
    </div>
  );
};

export default AccountStatus;
