"use client";
import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from '@/components/ui/table';
import TableHeading, { TableHeaderColumn } from '@/components/tables/tableHeader';
import Badge from '@/components/ui/badge/Badge';
import PermissionWrapper from '@/components/common/PermissionWrapper';
import { OccupationItem } from '@/services/types/occupation';

interface OccupationsTableProps {
  data: OccupationItem[];
  isLoading: boolean;
  searchTerm?: string;
  onClearSearch?: () => void;
  onEdit: (item: OccupationItem) => void;
  onDelete?: (item: OccupationItem) => void;
  onRestore?: (item: OccupationItem) => void;
  onManageSpecialties: (item: OccupationItem) => void;
  onCreateNew: () => void;
}

const TABLE_COLUMNS: TableHeaderColumn[] = [
  { key: 'id', label: 'ID', className: 'w-16 text-center' },
  { key: 'name', label: 'Occupation Name', className: 'w-1/4' },
  { key: 'specialties', label: 'Associated Specializations', className: 'w-2/5' },
  { key: 'jobs', label: 'Active Jobs', className: 'w-28 text-center' },
  { key: 'actions', label: 'Actions', className: 'w-36 text-right' },
];

export const OccupationsTable: React.FC<OccupationsTableProps> = ({
  data,
  isLoading,
  searchTerm,
  onClearSearch,
  onEdit,
  onDelete,
  onRestore,
  onManageSpecialties,
  onCreateNew,
}) => {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeading columns={TABLE_COLUMNS} />
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell className="text-center py-12 px-6" colSpan={TABLE_COLUMNS.length}>
                <div className="flex items-center justify-center gap-3">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary border-t-transparent" />
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    Loading occupations...
                  </p>
                </div>
              </TableCell>
            </TableRow>
          ) : data.length === 0 ? (
            <TableRow>
              <TableCell className="text-center py-12 px-6" colSpan={TABLE_COLUMNS.length}>
                <div className="max-w-sm mx-auto text-center">
                  <div className="w-12 h-12 mx-auto rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400 mb-3">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                    No occupations found
                  </h4>
                  {searchTerm ? (
                    <>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 mb-4">
                        No results matching &ldquo;{searchTerm}&rdquo;. Try a different search term or clear the filter.
                      </p>
                      {onClearSearch && (
                        <button
                          onClick={onClearSearch}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        >
                          Clear search
                        </button>
                      )}
                    </>
                  ) : (
                    <>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 mb-4">
                        Get started by creating your first occupation.
                      </p>
                      <PermissionWrapper module="jobs" action="add">
                        <button
                          onClick={onCreateNew}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                          <span>Add Occupation</span>
                        </button>
                      </PermissionWrapper>
                    </>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ) : (
            data.map((occupation) => {
              const specialties = occupation.specialty || [];
              const publishedJobs = occupation.publishedJobCount || 0;

              return (
                <TableRow
                  key={occupation.id}
                  className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  {/* ID */}
                  <TableCell className="py-4 px-6 text-center text-xs text-gray-500 dark:text-gray-400 font-mono">
                    #{occupation.id}
                  </TableCell>

                  {/* Name */}
                  <TableCell className="py-4 px-6">
                    <div className="font-medium text-sm text-gray-900 dark:text-white">
                      {occupation.name}
                    </div>
                  </TableCell>

                  {/* Associated Specializations */}
                  <TableCell className="py-4 px-6">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {specialties.length === 0 ? (
                        <span className="text-xs text-gray-400 italic">
                          No specializations yet
                        </span>
                      ) : (
                        <>
                          {specialties.slice(0, 4).map((spec) => (
                            <Badge
                              key={spec.id}
                              variant="light"
                              color="primary"
                              size="sm"
                              className="font-normal"
                            >
                              {spec.name}
                            </Badge>
                          ))}
                          {specialties.length > 4 && (
                            <Badge variant="light" color="light" size="sm">
                              +{specialties.length - 4} more
                            </Badge>
                          )}
                        </>
                      )}

                      <button
                        type="button"
                        onClick={() => onManageSpecialties(occupation)}
                        className="ml-1 text-xs text-primary hover:text-primary/80 font-medium hover:underline inline-flex items-center gap-0.5"
                      >
                        <span>Manage</span>
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  </TableCell>

                  {/* Active Jobs */}
                  <TableCell className="py-4 px-6 text-center">
                    <Badge
                      variant="light"
                      color={publishedJobs > 0 ? 'success' : 'light'}
                      size="sm"
                    >
                      {publishedJobs} jobs
                    </Badge>
                  </TableCell>

                  {/* Actions */}
                  <TableCell className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {/* Manage Specializations Button */}
                      <button
                        type="button"
                        onClick={() => onManageSpecialties(occupation)}
                        title="Manage specializations"
                        className="p-1.5 rounded-md text-gray-500 hover:text-primary hover:bg-primary/10 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                      </button>

                      {/* Edit Button */}
                      <PermissionWrapper module="jobs" action="edit">
                        <button
                          type="button"
                          onClick={() => onEdit(occupation)}
                          title="Edit occupation"
                          className="p-1.5 rounded-md text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                      </PermissionWrapper>

                      {/* Delete or Restore Button */}
                      {occupation.isDropdown === false ? (
                        onRestore && (
                          <PermissionWrapper module="jobs" action="edit">
                            <button
                              type="button"
                              onClick={() => onRestore(occupation)}
                              title="Restore occupation"
                              className="p-1.5 rounded-md text-gray-500 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-950/40 transition-colors"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                              </svg>
                            </button>
                          </PermissionWrapper>
                        )
                      ) : (
                        onDelete && (
                          <PermissionWrapper module="jobs" action="delete">
                            <button
                              type="button"
                              onClick={() => onDelete(occupation)}
                              title="Delete occupation"
                              className="p-1.5 rounded-md text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </PermissionWrapper>
                        )
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
};

