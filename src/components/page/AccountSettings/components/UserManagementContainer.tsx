'use client';

import React from 'react';
import UserTable from './UserTable';
import PermissionProvider from '@/context/PermissionContext';

const MOCK_CURRENT_USER_PERMISSIONS = {
  tickets: { view: true, create: true, update: true, delete: true },
  jobSeekers: { view: true, create: true, update: true, delete: false },
  employers: { view: true, create: true, update: true, delete: false },
  jobs: { view: true, create: true, update: true, delete: true },
  applications: { view: true, create: false, update: true, delete: false },
  coupons: { view: true, create: true, update: true, delete: true },
  blog: { view: true, create: true, update: true, delete: false },
  careers: { view: true, create: false, update: false, delete: false },
  unlockRequest: { view: true, create: false, update: false, delete: false },
};

const UserManagementContainer: React.FC = () => {
  return (
    <PermissionProvider userPermissions={MOCK_CURRENT_USER_PERMISSIONS}>
      <div className="p-6">
        <UserTable />
      </div>
    </PermissionProvider>
  );
};

export default UserManagementContainer;
