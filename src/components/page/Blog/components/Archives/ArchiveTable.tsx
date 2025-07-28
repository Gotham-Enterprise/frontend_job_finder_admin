import React from 'react';
import { formatDate } from '@/services/utils/dateUtils';
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
  TableHeader,
} from '../../../../ui/table';
import Badge from '../../../../ui/badge/Badge';
import Checkbox from '../../../../form/input/Checkbox';

interface ArchiveTableColumn {
  key: string;
  label: string;
  className?: string;
}

interface ArchiveTableProps {
  data?: {
    data: any[];
    metaData: {
      totalCount: number;
      currentPageTotalItems: number;
    };
  };
  isLoading: boolean;
  tableColumns: ArchiveTableColumn[];
  getStatusVariant: (status: string) => 'light' | 'solid';
  onRestorePost: (postId: string) => void;
  selectedPosts: string[];
  onSelectPost: (postId: string, selected: boolean) => void;
  onSelectAll: (selected: boolean) => void;
  isRestoring?: boolean;
}

const ArchiveTable: React.FC<ArchiveTableProps> = ({
  data,
  isLoading,
  tableColumns,
  getStatusVariant,
  onRestorePost,
  selectedPosts,
  onSelectPost,
  onSelectAll,
  isRestoring = false,
}) => {
  const allSelected = data?.data && data.data.length > 0 && selectedPosts.length === data.data.length;

  return (
    <div 
      className="relative overflow-auto"
      style={{ 
        maxHeight: '600px',
        scrollbarWidth: 'thin',
        scrollbarColor: '#9CA3AF #F3F4F6'
      }}
    >
      <div className="min-w-full">
        <Table>        
        <TableHeader>
          <TableRow className="border-b border-gray-200 dark:border-gray-800">
            <TableCell className="py-4 px-6 w-12 font-semibold text-gray-900 dark:text-white">
              <Checkbox
                checked={allSelected || false}
                onChange={(checked) => onSelectAll(checked)}
              />
            </TableCell>
            {tableColumns.slice(1).map((column) => (
              <TableCell
                key={column.key}
                className={`py-4 px-6 font-semibold text-gray-900 dark:text-white${column.className || ''}`}
              >
                {column.label}
              </TableCell>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell className="text-center py-8 px-6" colSpan={7}>
                <div className="flex items-center justify-center gap-3">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-brand-500"></div>
                  <p className="text-gray-500 dark:text-gray-400">Loading archived posts...</p>
                </div>
              </TableCell>
            </TableRow>
          ) : !data?.data?.length ? (
            <TableRow>
              <TableCell className="text-center py-8 px-6" colSpan={7}>
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m0 0V9a2 2 0 012-2h8a2 2 0 012 2v4M6 13h12" />
                    </svg>
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 mb-2">No archived blog posts found</p>
                  <p className="text-sm text-gray-400 dark:text-gray-500">Archived posts will appear here when you archive them from the main blog list</p>                 
                </div>
              </TableCell>
            </TableRow>
          ) : (
            data.data.map((post: any) => (
              <TableRow key={post.id} className="border-b text-sm border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                <TableCell className="py-4 px-6 w-12">
                  <Checkbox
                    checked={selectedPosts.includes(post.id)}
                    onChange={(checked) => onSelectPost(post.id, checked)}
                  />
                </TableCell>
                <TableCell className="py-4 px-6">
                  <div className="flex items-center gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-gray-900 dark:text-white truncate">
                        {post.title}
                      </p>
                      {post.seo?.description && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate mt-1">
                          {post.seo.description}
                        </p>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="py-4 px-6">
                  <div className="flex items-center gap-2">
                    <span className="inline-block px-2 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-md">
                      {post.category?.name || 'No category'}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="py-4 px-6">
                  <div className="flex flex-wrap gap-1">
                    {post.tags?.length > 0 ? (
                      post.tags.slice(0, 2).map((tag: any) => (
                        <span
                          key={tag.id}
                          className="inline-block px-2 py-1 text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 rounded-md"
                        >
                          {tag.name}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-gray-400 dark:text-gray-500">
                        No tags
                      </span>
                    )}
                    {post.tags?.length > 2 && (
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        +{post.tags.length - 2} more
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="py-4 px-6">
                  <Badge variant={getStatusVariant(post.status)}>
                    {post.status?.charAt(0).toUpperCase() + post.status?.slice(1)}
                  </Badge>
                </TableCell>
                <TableCell className="py-4 px-6">
                  <p className="text-sm text-gray-900 dark:text-white">
                    {formatDate(post.createdAt)}
                  </p>
                </TableCell>
                <TableCell className="py-4 px-6 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => onRestorePost(post.id)}
                      disabled={isRestoring}
                      className="inline-flex items-center justify-center px-3 py-1.5 text-sm font-medium bg-green-100 text-green-700 hover:bg-green-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-md transition-colors"
                      title="Restore Post"
                    >
                      {isRestoring ? (
                        <>
                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-green-700 mr-1"></div>
                          Restoring...
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                          </svg>
                          Restore
                        </>
                      )}
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      </div>
    </div>
  );
};

export default ArchiveTable;
