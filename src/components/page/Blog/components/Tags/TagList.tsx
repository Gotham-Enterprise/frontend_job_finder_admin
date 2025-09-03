"use client";
import React from "react";
import Input from "@/components/form/input/InputField";
import Checkbox from "@/components/form/input/Checkbox";
import { Table, TableHeader, TableBody, TableRow, TableCell } from "@/components/ui/table";
import Pagination from "@/components/tables/Pagination";
import BulkActionDropdown from "@/components/ui/BulkActionDropdown";
import { Tag } from "@/services/api/tag";
import { PencilIcon, TrashBinIcon } from '@/icons';
import FullScreenSpinner from '@/components/ui/FullScreenSpinner';

interface TagListProps {
  tags: Tag[];
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onEditTag: (tag: Tag) => void;
  onDeleteTag: (tagIds: string[]) => void;
  isDeleting?: boolean;
  selectedTags?: string[];
  onSelectTag?: (tagId: string, selected: boolean) => void;
  onSelectAll?: (selected: boolean) => void;
  onBulkDelete?: () => void;
  onClearSelection?: () => void;
  isBulkDeleting?: boolean;
  deletingTagIds?: string[];
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  itemsPerPage?: number;
  onItemsPerPageChange?: (itemsPerPage: number) => void;
  metaData?: {
    page: number;
    limit: number;
    totalPages: number;
    totalCount: number;
    currentPageTotalItems: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

const TagList: React.FC<TagListProps> = ({
  tags,
  searchTerm,
  onSearchChange,
  onEditTag,
  onDeleteTag,
  isDeleting = false,
  selectedTags = [],
  onSelectTag,
  onSelectAll,
  onBulkDelete,
  onClearSelection,
  isBulkDeleting = false,
  deletingTagIds = [],
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  itemsPerPage = 20,
  onItemsPerPageChange,
  metaData,
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <>
      <FullScreenSpinner 
        isVisible={isDeleting || isBulkDeleting} 
        message="Deleting tag..." 
      />
      
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Tags
          </h2>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Input
              type="text"
              placeholder="Search tags..."
              defaultValue={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {onBulkDelete && onClearSelection && (
            <BulkActionDropdown
              selectedItems={selectedTags}
              itemType="tags"
              onBulkDelete={onBulkDelete}
              onClearSelection={onClearSelection}
              isDeleting={isBulkDeleting}
            />
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table className="w-full">
          <TableHeader className="bg-gray-50 dark:bg-gray-700">
            <TableRow>
              {onSelectTag && onSelectAll && (
                <TableCell isHeader className="px-6 py-3 w-12">
                  <Checkbox
                    checked={selectedTags.length === tags.length && tags.length > 0}
                    onChange={(checked) => onSelectAll(checked)}
                  />
                </TableCell>
              )}
              <TableCell isHeader className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Name
              </TableCell>
              <TableCell isHeader className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Description
              </TableCell>
              <TableCell isHeader className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Created At
              </TableCell>
              <TableCell isHeader className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Actions
              </TableCell>
            </TableRow>
          </TableHeader>
          <TableBody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {tags.map((tag) => (
              <TableRow key={tag.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                {onSelectTag && (
                  <TableCell className="px-6 py-4 w-12">
                    <Checkbox
                      checked={selectedTags.includes(tag.id)}
                      onChange={(checked) => onSelectTag(tag.id, checked)}
                    />
                  </TableCell>
                )}
                <TableCell className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                      #{tag.name}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="px-6 py-4">
                  <div className="text-sm text-gray-500 dark:text-gray-400 max-w-xs truncate">
                    {tag.description || '—'}
                  </div>
                </TableCell>
                <TableCell className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {formatDate(tag.createdAt)}
                  </div>
                </TableCell>
                <TableCell className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end space-x-2">
                 <button
                                                           onClick={() => onEditTag(tag)}
                                                          className="inline-flex text-brand-400  items-center justify-center w-8 h-8 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-md transition-colors"
                                                          title="Edit"
                                                            disabled={deletingTagIds.includes(tag.id)}
                                                        >
                                                          <PencilIcon className="text-brand-400" />
                                                        </button>
                                                        <button
                                                          onClick={() => onDeleteTag([tag.id])}
                                                          className="inline-flex text-brand-400 items-center justify-center w-8 h-8 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                                          title="Delete"
                                                          disabled={deletingTagIds.includes(tag.id)}
                                                        >
                                                          <TrashBinIcon className="text-brand-400" />
                                                        </button>

                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {tags.length === 0 && (
          <div className="p-6 text-center">
            <p className="text-gray-500 dark:text-gray-400">
              {metaData?.totalCount === 0 ? 'No tags found.' : 'No tags on this page.'}
            </p>
          </div>
        )}
      </div>

      {metaData && metaData.totalCount > 0 && onPageChange && (
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
          
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-700 dark:text-gray-300">Items per page:</span>
              <select
                value={itemsPerPage}
                onChange={(e) => onItemsPerPageChange?.(Number(e.target.value))}
                className="rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-1 text-sm text-gray-900 dark:text-white focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
            
            {/* Show pagination or item count */}
            {metaData.totalPages > 1 ? (
              <Pagination
                currentPage={currentPage}
                totalPages={metaData.totalPages}
                onPageChange={onPageChange}
              />
            ) : (
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Showing {((metaData.page - 1) * metaData.limit) + 1} of {Math.min(metaData.page * metaData.limit, metaData.totalCount)} results
              </div>
            )}
          </div>
        </div>
      )}
    </div>
    </>
  );
};

export default TagList;
