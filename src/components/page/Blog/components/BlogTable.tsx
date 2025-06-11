import React from 'react';
import { formatDate } from '@/services/utils/dateUtils';
import Image from "next/image";
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
  TableHeader,
} from '../../../ui/table';
import Badge from '../../../ui/badge/Badge';
import Button from '../../../ui/button/Button';
import Checkbox from '../../../form/input/Checkbox';
import { EyeIcon, PencilIcon, TrashBinIcon } from '@/icons';
import { BlogTableProps } from '@/services/types/BlogTypes';

const BlogTable: React.FC<BlogTableProps> = ({
  data,
  isLoading,
  tableColumns,
  getStatusVariant,
  onViewPost,
  onEditPost,
  onDeletePost,
  selectedPosts,
  onSelectPost,
  onSelectAll,
}) => {
  const allSelected = data?.data?.length > 0 && selectedPosts.length === data.data.length;
  const someSelected = selectedPosts.length > 0 && !allSelected;

  return (
    <div className="overflow-x-auto">      <Table>        
        <TableHeader>
          <TableRow className="border-b border-gray-200 dark:border-gray-800">
            <TableCell className="py-4 px-6 w-12 font-semibold text-gray-900 dark:text-white">
              <Checkbox
                checked={allSelected}
                onChange={(checked) => onSelectAll(checked)}
              />
            </TableCell>
            {tableColumns.slice(1).map((column) => (
              <TableCell
                key={column.key}
                className={`py-4 px-6 font-semibold text-gray-900 dark:text-white ${column.className || ''}`}
              >
                {column.label}
              </TableCell>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell className="text-center py-8 px-6" colSpan={9}>
                <div className="flex items-center justify-center gap-3">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-brand-500"></div>
                  <p className="text-gray-500 dark:text-gray-400">Loading...</p>
                </div>
              </TableCell>
            </TableRow>
          ) : !data?.data?.length ? (
            <TableRow>
              <TableCell className="text-center py-8 px-6" colSpan={9}>
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 mb-2">No blog posts found</p>                 
                
                </div>
              </TableCell>
            </TableRow>
          ) : (
            data.data.map((post: any) => (
              <TableRow key={post.id} className="border-b border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                <TableCell className="py-4 px-6 w-12">
                  <Checkbox
                    checked={selectedPosts.includes(post.id)}
                    onChange={(checked) => onSelectPost(post.id, checked)}
                  />
                </TableCell>
                <TableCell className="py-4 px-6">
                  <div className="flex items-center gap-3">
                    {post.featuredImage?.url ? (
                      <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-700 flex-shrink-0">
                            <Image
                                            width={231}
                                            height={48}
                                             className="w-full h-full object-cover"
                                            src={post.featuredImage.url}
                                            alt={post.featuredImage.alt || post.title}
                                          />

                     
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                        <svg className="w-6 h-6 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-gray-900 dark:text-white truncate">
                        {post.title}
                      </p>
                      {post.excerpt && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate mt-1">
                          {post.excerpt}
                        </p>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="py-4 px-6">
                  <div className="flex items-center gap-2">
                    {post.author?.avatar ? (
                      <Image
                      width={231}
                      height={48}
                       className="w-6 h-6 rounded-full"
                       src={post.author.avatar}
                       alt={post.author.name}
                    />

                    ) : (
                      <div className="w-6 h-6 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                        <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                          {post.author?.name?.charAt(0) || 'U'}
                        </span>
                      </div>
                    )}
                    <span className="text-sm text-gray-900 dark:text-white">
                      {post.author?.name || 'Unknown'}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="py-4 px-6">
                  <div className="flex flex-wrap gap-1">
                    {post.categories?.length > 0 ? (
                      post.categories.slice(0, 2).map((category: any) => (
                        <span
                          key={category.id}
                          className="inline-block px-2 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-md"
                        >
                          {category.name}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-gray-400 dark:text-gray-500">
                        No categories
                      </span>
                    )}
                    {post.categories?.length > 2 && (
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        +{post.categories.length - 2} more
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
                    {post.status === 'published' && post.publishedDate ? (
                      formatDate(post.publishedDate)
                    ) : post.status === 'draft' ? (
                      <span className="text-gray-400 dark:text-gray-500 italic">Draft</span>
                    ) : (
                      <span className="text-gray-400 dark:text-gray-500 italic">Not published</span>
                    )}
                  </p>
                </TableCell>
                <TableCell className="py-4 px-6 text-center">
                  <span className="text-sm text-gray-900 dark:text-white">
                    {post.commentCount || 0}
                  </span>
                </TableCell>
                <TableCell className="py-4 px-6 text-center">
                  <span className="text-sm text-gray-900 dark:text-white">
                    {post.viewCount || 0}
                  </span>
                </TableCell>
                <TableCell className="py-4 px-6 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-blue-600 dark:text-blue-400"
                      onClick={() => onViewPost(post.id)}
                      startIcon={<EyeIcon />}
                    >
                      View
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-green-600 dark:text-green-400"
                      onClick={() => onEditPost(post.id)}
                      startIcon={<PencilIcon />}
                    >
                      Edit
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-red-600 dark:text-red-400"
                      onClick={() => onDeletePost(post.id)}
                      startIcon={<TrashBinIcon />}
                    >
                      Delete
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default BlogTable;
