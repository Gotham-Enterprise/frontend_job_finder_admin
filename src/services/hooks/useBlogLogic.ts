import { useState, useMemo, useTransition, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useBlogPosts, useDeleteBlogPost, useBulkDeleteBlogPosts, useBulkUpdateBlogStatus } from '@/services/hooks/useBlog';
import { useCategoriesForDropdown } from '@/services/hooks/useCategories';
import { useTagsForDropdown } from '@/services/hooks/useTags';
import { BlogFilters } from '@/services/types/blog';
import { useConfirmation } from '@/hooks/useConfirmation';
import { showToast } from '@/services/utils/toast';

export const useBlogLogic = () => {
  const router = useRouter();
  const [filters, setFilters] = useState<BlogFilters>({
    page: 1,
    limit: 10,
    search: '',
    status: undefined,
    category: '',
    tag: '',
    author: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });
  const [searchInput, setSearchInput] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [selectedPosts, setSelectedPosts] = useState<string[]>([]);

  const { data, isLoading, error, refetch } = useBlogPosts(filters);
  const { data: categoriesData, isLoading: isCategoriesLoading } = useCategoriesForDropdown();
  const { data: tagsData, isLoading: isTagsLoading } = useTagsForDropdown();
  const { mutate: deleteBlogPost, isPending: isDeleting } = useDeleteBlogPost();
  const { mutate: bulkDeleteBlogPosts, isPending: isBulkDeleting } = useBulkDeleteBlogPosts();
  const { mutate: bulkUpdateStatus, isPending: isUpdatingStatus } = useBulkUpdateBlogStatus();
  const confirmation = useConfirmation();

  const tableColumns = useMemo(() => [
    { key: 'select', label: '', className: 'w-12' },
    { key: 'title', label: 'Title' },
    { key: 'category', label: 'Category' },
    { key: 'tags', label: 'Tags' },
    { key: 'status', label: 'Status' },
    { key: 'createdAt', label: 'Created At' },
    { key: 'actions', label: '', className: 'text-right' },
  ], []);

  const statusOptions = useMemo(() => [
    { value: '', label: 'All Status' },
    { value: 'published', label: 'Published' },
    { value: 'draft', label: 'Draft' },
  ], []);

  const sortOptions = useMemo(() => [
    { value: 'createdAt-desc', label: 'Newest First' },
    { value: 'createdAt-asc', label: 'Oldest First' },
    { value: 'title-asc', label: 'Title A-Z' },
    { value: 'title-desc', label: 'Title Z-A' },
  ], []);

  const categoryOptions = useMemo(() => {
    if (isCategoriesLoading || !categoriesData) {
      return [{ value: '', label: 'All Categories' }];
    }
    
    const allOption = { value: '', label: 'All Categories' };
    const dynamicCategories = categoriesData.map((category: any) => ({
      value: category.name,  // Use name instead of id for API compatibility
      label: category.name,
    }));
    
    return [allOption, ...dynamicCategories];
  }, [categoriesData, isCategoriesLoading]);

  const tagOptions = useMemo(() => {
    if (isTagsLoading || !tagsData) {
      return [{ value: '', label: 'All Tags' }];
    }
    
    const allOption = { value: '', label: 'All Tags' };
    const dynamicTags = tagsData.map((tag: any) => ({
      value: tag.name, 
      label: tag.name,
    }));
    
    return [allOption, ...dynamicTags];
  }, [tagsData, isTagsLoading]);

  const itemsPerPageOptions = useMemo(() => [
    { value: '5', label: '5 per page' },
    { value: '10', label: '10 per page' },
    { value: '20', label: '20 per page' },
    { value: '50', label: '50 per page' },
  ], []);

  const clearIndividualFilter = useCallback((filterKey: string) => {
    startTransition(() => {
      switch (filterKey) {
        case 'status':
          setFilters(prev => ({ ...prev, status: undefined, page: 1 }));
          break;
        case 'category':
          setFilters(prev => ({ ...prev, category: '', page: 1 }));
          break;
        case 'tag':
          setFilters(prev => ({ ...prev, tag: '', page: 1 }));
          break;
        case 'sortBy':
          setFilters(prev => ({ 
            ...prev, 
            sortBy: 'createdAt', 
            sortOrder: 'desc', 
            page: 1 
          }));
          break;
        case 'limit':
          setFilters(prev => ({ ...prev, limit: 10, page: 1 }));
          break;
        default:
          break;
      }
    });
  }, []);

  const clearAllFilters = useCallback(() => {
    startTransition(() => {
      setFilters({
        page: 1,
        limit: 10,
        search: '',
        status: undefined,
        category: '',
        tag: '',
        author: '',
        sortBy: 'createdAt',
        sortOrder: 'desc',
      });
      setSearchInput('');
    });
  }, []);

  const hasActiveFilters = useMemo(() => {
    return !!(
      searchInput ||
      filters.status ||
      filters.category ||
      filters.tag ||
      filters.author ||
      (filters.sortBy && filters.sortBy !== 'createdAt') ||
      (filters.sortOrder && filters.sortOrder !== 'desc') ||
      (filters.limit && filters.limit !== 10)
    );
  }, [searchInput, filters]);

  const filterChange = useMemo(() => (key: keyof BlogFilters, value: any) => {
    startTransition(() => {
      if (key === 'sortBy') {
       
        const [sortBy, sortOrder] = value.split('-');
        setFilters(prev => ({ 
          ...prev, 
          sortBy: sortBy === '' ? undefined : sortBy,
          sortOrder: sortOrder === '' ? undefined : sortOrder,
          page: 1
        }));
      } else {
        setFilters(prev => ({ 
          ...prev, 
          [key]: value === '' ? undefined : value,
          page: 1
        }));
      }
    });
  }, []);

  const initPageChange = useMemo(() => (newPage: number) => {
    startTransition(() => {
      setFilters(prev => ({ ...prev, page: newPage }));
    });
  }, []);

  const getStatusVariant = useMemo(() => (status: string): 'light' | 'solid' => {
    switch (status) {
      case 'published': return 'solid';
      case 'draft': return 'light';
      case 'archived': return 'light';
      default: return 'light';
    }
  }, []);

  const selectPost = (postId: string, selected: boolean) => {
    setSelectedPosts(prev => 
      selected 
        ? [...prev, postId]
        : prev.filter(id => id !== postId)
    );
  };

  const selectAll = (selected: boolean) => {
    if (selected && data?.data) {
      setSelectedPosts(data.data.map((post: any) => post.id));
    } else {
      setSelectedPosts([]);
    }
  };

  const editPost = (postId: string) => {
    router.push(`/admin/blog/edit/${postId}`);
  };

  const previewPost = (postId: string) => {
    window.open(`/blog/preview/${postId}`, '_blank');
  };

  const deletePost = async (postId: string) => {
    const confirmed = await confirmation.confirm({
      title: 'Delete Blog Post',
      message: 'Are you sure you want to delete this blog post?',
      confirmText: 'Delete',
      cancelText: 'Cancel'
    });

    if (confirmed) {
      deleteBlogPost(postId, {
        onSuccess: () => {
          console.log('Blog post deleted successfully');
          setSelectedPosts(prev => prev.filter(id => id !== postId));
        },
        onError: (error) => {
          console.error('Error deleting blog post:', error);
        }
      });
    }
  };

  const bulkDeletePosts = async () => {
    if (selectedPosts.length === 0) return;
    
    const count = selectedPosts.length;
    const message = count === 1 
      ? 'Are you sure you want to delete this blog post? This action cannot be undone.' 
      : `Are you sure you want to delete ${count} blog posts? This action cannot be undone.`;
    
    const confirmed = await confirmation.confirm({
      title: `Delete ${count === 1 ? 'Blog Post' : 'Blog Posts'}`,
      message,
      confirmText: 'Delete',
      cancelText: 'Cancel'
    });

    if (confirmed) {
      bulkDeleteBlogPosts(selectedPosts, {
        onSuccess: () => {
          console.log('Blog posts deleted successfully');
          setSelectedPosts([]);
          showToast.success('Success', `${count} blog ${count === 1 ? 'post' : 'posts'} deleted successfully`);
        },
        onError: (error) => {
          console.error('Error deleting blog posts:', error);
          showToast.error('Error', 'Failed to delete blog posts. Please try again.');
        }
      });
    }
  };

  const bulkPublishPosts = async () => {
    if (selectedPosts.length === 0) return;
    
    const count = selectedPosts.length;
    const message = count === 1 
      ? 'Are you sure you want to publish this blog post?' 
      : `Are you sure you want to publish ${count} blog posts?`;
    
    const confirmed = await confirmation.confirm({
      title: `Publish ${count === 1 ? 'Blog Post' : 'Blog Posts'}`,
      message,
      confirmText: 'Publish',
      cancelText: 'Cancel'
    });

    if (confirmed) {
      bulkUpdateStatus({ blogIds: selectedPosts, status: 'published' }, {
        onSuccess: () => {
          console.log('Blog posts published successfully');
          setSelectedPosts([]);
          showToast.success('Success', `${count} blog ${count === 1 ? 'post' : 'posts'} published successfully`);
        },
        onError: (error) => {
          console.error('Error publishing blog posts:', error);
          showToast.error('Error', 'Failed to publish blog posts. Please try again.');
        }
      });
    }
  };

  const bulkDraftPosts = async () => {
    if (selectedPosts.length === 0) return;
    
    const count = selectedPosts.length;
    const message = count === 1 
      ? 'Are you sure you want to set this blog post as draft?' 
      : `Are you sure you want to set ${count} blog posts as draft?`;
    
    const confirmed = await confirmation.confirm({
      title: `Set as Draft ${count === 1 ? 'Blog Post' : 'Blog Posts'}`,
      message,
      confirmText: 'Set as Draft',
      cancelText: 'Cancel'
    });

    if (confirmed) {
      bulkUpdateStatus({ blogIds: selectedPosts, status: 'draft' }, {
        onSuccess: () => {
          console.log('Blog posts set as draft successfully');
          setSelectedPosts([]);
          showToast.success('Success', `${count} blog ${count === 1 ? 'post' : 'posts'} set as draft successfully`);
        },
        onError: (error) => {
          console.error('Error setting blog posts as draft:', error);
          showToast.error('Error', 'Failed to set blog posts as draft. Please try again.');
        }
      });
    }
  };

  const addNewPost = () => {
    router.push('/admin/blog/add-new');
  };

  const clearSelectedPosts = () => {
    setSelectedPosts([]);
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      startTransition(() => {
        setFilters(prev => ({ ...prev, search: searchInput, page: 1 }));
      });
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchInput]);

  return {
    filters,
    searchInput,
    setSearchInput,
    isFilterOpen,
    setIsFilterOpen,
    isPending,
    selectedPosts,
    
    data,
    isLoading,
    error,
    refetch,
    isDeleting,
    isBulkDeleting,
    isUpdatingStatus,
    
    tableColumns,
    statusOptions,
    sortOptions,
    categoryOptions,
    tagOptions,
    itemsPerPageOptions,
    
    filterChange,
    initPageChange,
    getStatusVariant,
    selectPost,
    selectAll,
    editPost,
    previewPost,
    deletePost,
    bulkDeletePosts,
    bulkPublishPosts,
    bulkDraftPosts,
    clearSelectedPosts,
    addNewPost,
    hasActiveFilters,
    clearIndividualFilter,
    clearAllFilters,
    confirmation,
  };
};
