import React from 'react';
import { useTableActions } from '../../hooks/useTableActions';
import { UserPermissions } from '../../services/types/permissions';

interface PermissionAwareTableProps<T = any> {
  data: T[];
  columns: Array<{
    key: string;
    label: string;
    render?: (value: any, item: T) => React.ReactNode;
  }>;
  module: keyof UserPermissions;
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  onView?: (item: T) => void;
  onCreate?: () => void;
  customActions?: Array<{
    key: string;
    label: string;
    icon?: React.ReactNode;
    variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'warning';
    onClick: (item: T) => void;
    show: (item: T) => boolean;
    disabled?: (item: T) => boolean;
    requiredPermission?: keyof UserPermissions[keyof UserPermissions];
  }>;
  loading?: boolean;
  emptyMessage?: string;
  showCreateButton?: boolean;
  createButtonLabel?: string;
}

const PermissionAwareTable = <T extends Record<string, any>>({
  data,
  columns,
  module,
  onEdit,
  onDelete,
  onView,
  onCreate,
  customActions,
  loading = false,
  emptyMessage = "No data available",
  showCreateButton = true,
  createButtonLabel = "Create New",
}: PermissionAwareTableProps<T>) => {
  const {
    getRowActions,
    canCreate,
    hasAnyPermission,
    loading: permissionsLoading,
    error: permissionsError,
  } = useTableActions({
    module,
    actions: {
      view: onView ? { onClick: onView } : undefined,
      edit: onEdit ? { onClick: onEdit } : undefined,
      delete: onDelete ? { onClick: onDelete } : undefined,
      create: onCreate ? { onClick: onCreate } : undefined,
      custom: customActions,
    },
  });

  // Show loading state
  if (loading || permissionsLoading) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow">
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            {/* Header skeleton */}
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
            
            {/* Table header skeleton */}
            <div className="mt-6 grid grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
              ))}
            </div>
            
            {/* Table rows skeleton */}
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="grid grid-cols-4 gap-4">
                  {[...Array(4)].map((_, j) => (
                    <div key={j} className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (permissionsError) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6">
        <div className="text-center text-red-600 dark:text-red-400">
          <p>Error loading permissions: {permissionsError}</p>
        </div>
      </div>
    );
  }

  // Check if user has any permissions for this module
  if (!hasAnyPermission()) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6">
        <div className="text-center text-gray-500 dark:text-gray-400">
          <p>You don't have permission to view this data.</p>
        </div>
      </div>
    );
  }

  // Check if we have any actions to show
  const hasActions = getRowActions(data[0] || {}).length > 0;

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow">
      {/* Header with Create Button */}
      {showCreateButton && canCreate() && onCreate && (
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              {module.charAt(0).toUpperCase() + module.slice(1)} Management
            </h3>
            <button
              onClick={onCreate}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500"
            >
              {createButtonLabel}
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                >
                  {column.label}
                </th>
              ))}
              {hasActions && (
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                >
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (hasActions ? 1 : 0)}
                  className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 text-center"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((item, index) => {
                const rowActions = getRowActions(item);
                return (
                  <tr
                    key={index}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    {columns.map((column) => (
                      <td
                        key={column.key}
                        className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100"
                      >
                        {column.render
                          ? column.render(item[column.key], item)
                          : item[column.key]?.toString() || '-'}
                      </td>
                    ))}
                    {hasActions && (
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          {rowActions.map((action) => (
                            <button
                              key={action.key}
                              onClick={() => action.onClick(item)}
                              disabled={action.disabled}
                              className={`inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                                action.variant === 'danger'
                                  ? 'text-red-700 bg-red-100 hover:bg-red-200 focus:ring-red-500 dark:text-red-400 dark:bg-red-900 dark:hover:bg-red-800'
                                  : action.variant === 'primary'
                                  ? 'text-brand-700 bg-brand-100 hover:bg-brand-200 focus:ring-brand-500 dark:text-brand-400 dark:bg-brand-900 dark:hover:bg-brand-800'
                                  : 'text-gray-700 bg-gray-100 hover:bg-gray-200 focus:ring-gray-500 dark:text-gray-400 dark:bg-gray-700 dark:hover:bg-gray-600'
                              }`}
                            >
                              {action.icon && <span className="mr-1">{action.icon}</span>}
                              {action.label}
                            </button>
                          ))}
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PermissionAwareTable;
