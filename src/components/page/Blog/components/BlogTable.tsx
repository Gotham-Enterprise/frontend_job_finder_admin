"use client"

import React, { useState } from 'react';
import { formatDate } from '@/services/utils/dateUtils';
import { processSlug } from '@/services/utils/slugUtils';
import { generateBlogUrl } from '@/config/constants';
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
  TableHeader,
} from '../../../ui/table';
import Badge from '../../../ui/badge/Badge';
import Checkbox from '../../../form/input/Checkbox';
import { PencilIcon, TrashBinIcon, EyeIcon, HorizontaLDots } from '@/icons';
import { BlogTableProps } from '@/services/types/BlogTypes';
import OptionsDropdown, { DropdownOption } from '../../../ui/OptionsDropdown/index';
import SocialShareModal from '../../../ui/SocialShareModal/index';

const BlogTable: React.FC<BlogTableProps> = ({
  data,
  isLoading,
  tableColumns,
  getStatusVariant,
  onEditPost,
  onDeletePost,
  onPreviewPost,
  selectedPosts,
  onSelectPost,
  onSelectAll,
}) => {
  const allSelected = data?.data?.length > 0 && selectedPosts.length === data.data.length;
  const someSelected = selectedPosts.length > 0 && !allSelected;

  const [shareModal, setShareModal] = useState<{
    isOpen: boolean;
    post: any | null;
  }>({
    isOpen: false,
    post: null,
  });


  const handleShare = (post: any) => {
    setShareModal({
      isOpen: true,
      post,
    });
  };

 
  const handleCloseShareModal = () => {
    setShareModal({
      isOpen: false,
      post: null,
    });
  };

  const generateShareUrl = (post: any): string => {
    const slug = processSlug(post.slug || post.title);
    return generateBlogUrl(slug);
  };

  const getAuthorName = (post: any): string => {
    const metadataAuthor = post?.metadata?.author;
    if (metadataAuthor) {
      return metadataAuthor.name || `${metadataAuthor.firstName || ''} ${metadataAuthor.lastName || ''}`.trim() || 'Unknown Author';
    }
    if (typeof post.author === 'string') {
      return post.author;
    } else if (post.author && typeof post.author === 'object') {
      return post.author.name || 'Unknown Author';
    }
    return 'No Author';
  };

  const getBlogTags = (post: any): string[] => {
    if (!post.tags || !Array.isArray(post.tags)) return [];
    
    return post.tags
      .map((tag: any) => typeof tag === 'string' ? tag : (tag?.name || ''))
      .filter(Boolean)
      .slice(0, 5); 
  };

  const getBlogImage = (post: any): string => {
    const image = post.featuredImage || 
                 post.image || 
                 (post as any)?.metadata?.image ||
                 (post as any)?.thumbnail;
    
    if (image) {
      if (typeof image === 'string') {
        return image;
      } else if (typeof image === 'object' && image.url) {
        return image.url;
      }
    }
    
    return ''; 
  };

  const getDropdownOptions = (post: any): DropdownOption[] => [
    {
      id: 'view',
      label: 'View',
      icon: <EyeIcon />,
      onClick: () => {
        if (onPreviewPost) {
          onPreviewPost(post.id);
        }
      },
    },
    {
      id: 'edit',
      label: 'Edit',
      icon: <PencilIcon />,
      onClick: () => onEditPost(post.id),
    },
    {
      id: 'share',
      label: 'Share',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
        </svg>
      ),
      onClick: () => handleShare(post),
    },
    {
      id: 'delete',
      label: 'Archive',
      icon: <TrashBinIcon />,
      onClick: () => onDeletePost(post.id),
      variant: 'danger' as const,
    },
  ];

  return (
    <>
      <div 
        className="relative"
      >
        <div className="min-w-full">
          <Table>        
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
                <TableCell className="text-center py-8 px-6" colSpan={8}>
                  <div className="flex items-center justify-center gap-3">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-brand-500"></div>
                    <p className="text-gray-500 dark:text-gray-400">Loading...</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : !data?.data?.length ? (
              <TableRow>
                <TableCell className="text-center py-8 px-6" colSpan={8}>
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
                        <button
                          onClick={() => onPreviewPost && onPreviewPost(post.id)}
                          className="text-left w-full group"
                        >
                          <div className="flex items-center gap-3">
                            {getBlogImage(post) && (
                              <div className="flex-shrink-0">
                                <img
                                  src={getBlogImage(post)}
                                  alt={post.title}
                                  className="w-8 h-8 rounded-full object-cover border border-gray-200 dark:border-gray-700"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = 'none';
                                  }}
                                />
                              </div>
                            )}
                            <p className="font-medium text-gray-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors cursor-pointer">
                              {post.title}
                            </p>
                           
                          </div>
                        </button>
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
                    <div className="flex items-center flex-wrap gap-1">
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
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-900 dark:text-white">
                        {getAuthorName(post)}
                      </span>
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
                    <OptionsDropdown
                      trigger={
                        <button className="inline-flex items-center justify-center w-8 h-8 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-md transition-colors">
                          <HorizontaLDots />
                        </button>
                      }
                      options={getDropdownOptions(post)}
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        </div>
      </div>

      {/* Social Share Modal */}
      <SocialShareModal
        isOpen={shareModal.isOpen}
        onClose={handleCloseShareModal}
        url={shareModal.post ? generateShareUrl(shareModal.post) : ''}
        title={shareModal.post?.title || ''}
        description={shareModal.post?.excerpt || shareModal.post?.description || ''}
        image={shareModal.post ? getBlogImage(shareModal.post) : ''}
        ogType="article"
        ogSiteName="Gotham Enterprises"
        author={shareModal.post ? getAuthorName(shareModal.post) : ''}
        publishedTime={shareModal.post?.createdAt}
        tags={shareModal.post ? getBlogTags(shareModal.post) : []}
      />
    </>
  );
};

export default BlogTable;
