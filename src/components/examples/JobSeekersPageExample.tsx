import React from 'react';
import PermissionAwareTable from '@/components/tables/PermissionAwareTable';

interface JobSeeker {
  id: string;
  name: string;
  email: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

// Example usage of PermissionAwareTable
const JobSeekersPage: React.FC = () => {
  // Sample data - replace with actual data fetching
  const jobSeekers: JobSeeker[] = [
    {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      status: 'active',
      createdAt: '2024-01-15',
    },
    {
      id: '2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      status: 'inactive',
      createdAt: '2024-01-10',
    },
  ];

  const handleView = (jobSeeker: JobSeeker) => {
    console.log('Viewing job seeker:', jobSeeker);
    // Navigate to view page
  };

  const handleEdit = (jobSeeker: JobSeeker) => {
    console.log('Editing job seeker:', jobSeeker);
    // Navigate to edit page
  };

  const handleDelete = (jobSeeker: JobSeeker) => {
    console.log('Deleting job seeker:', jobSeeker);
    // Show confirmation dialog and delete
  };

  const handleCreate = () => {
    console.log('Creating new job seeker');
    // Navigate to create page
  };

  const columns = [
    {
      key: 'name',
      label: 'Name',
    },
    {
      key: 'email',
      label: 'Email',
    },
    {
      key: 'status',
      label: 'Status',
      render: (status: string) => (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            status === 'active'
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
          }`}
        >
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
      ),
    },
    {
      key: 'createdAt',
      label: 'Created At',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
  ];

  // Custom actions example
  const customActions = [
    {
      key: 'activate',
      label: 'Activate',
      variant: 'success' as const,
      onClick: (jobSeeker: JobSeeker) => {
        console.log('Activating:', jobSeeker);
      },
      show: (jobSeeker: JobSeeker) => jobSeeker.status === 'inactive',
      requiredPermission: 'update' as const,
    },
    {
      key: 'deactivate',
      label: 'Deactivate',
      variant: 'warning' as const,
      onClick: (jobSeeker: JobSeeker) => {
        console.log('Deactivating:', jobSeeker);
      },
      show: (jobSeeker: JobSeeker) => jobSeeker.status === 'active',
      requiredPermission: 'update' as const,
    },
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Job Seekers Management
        </h1>
        <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
          Manage job seeker profiles and applications
        </p>
      </div>

      <PermissionAwareTable
        data={jobSeekers}
        columns={columns}
        module="jobSeekers"
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onCreate={handleCreate}
        customActions={customActions}
        emptyMessage="No job seekers found"
        createButtonLabel="Add Job Seeker"
      />
    </div>
  );
};

export default JobSeekersPage;
