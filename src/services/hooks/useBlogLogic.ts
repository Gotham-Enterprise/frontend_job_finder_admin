import { useState, useMemo, useTransition, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useBlogPosts, useDeleteBlogPost, useBulkDeleteBlogPosts } from '@/services/hooks/useBlog';
import { BlogFilters } from '@/services/types/blog';
import { useConfirmation } from '@/hooks/useConfirmation';

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
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);

  const { data, isLoading, error, refetch } = useBlogPosts(filters);
  const { mutate: deleteBlogPost, isPending: isDeleting } = useDeleteBlogPost();
  const { mutate: bulkDeleteBlogPosts, isPending: isBulkDeleting } = useBulkDeleteBlogPosts();
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
    { value: 'published', label: 'Published' },
    { value: 'draft', label: 'Draft' },
    { value: 'archived', label: 'Archived' },
  ], []);

  const sortOptions = useMemo(() => [
    { value: 'createdAt-desc', label: 'Newest First' },
    { value: 'createdAt-asc', label: 'Oldest First' },
    { value: 'title-asc', label: 'Title A-Z' },
    { value: 'title-desc', label: 'Title Z-A' },
  ], []);


  const categoryOptions = useMemo(() => [
    { value: '', label: 'All Categories' },
    { value: 'technology', label: 'Technology' },
    { value: 'business', label: 'Business' },
    { value: 'lifestyle', label: 'Lifestyle' },
    { value: 'travel', label: 'Travel' },
    { value: 'food', label: 'Food' },
  ], []);

  const tagOptions = useMemo(() => [
    { value: '', label: 'All Tags' },
    { value: 'react', label: 'React' },
    { value: 'nextjs', label: 'Next.js' },
    { value: 'javascript', label: 'JavaScript' },
    { value: 'typescript', label: 'TypeScript' },
    { value: 'programming', label: 'Programming' },
  ], []);

  const itemsPerPageOptions = useMemo(() => [
    { value: '5', label: '5 per page' },
    { value: '10', label: '10 per page' },
    { value: '20', label: '20 per page' },
    { value: '50', label: '50 per page' },
  ], []);

  // Status toggle handler
  const handleStatusToggle = useCallback((statuses: string[]) => {
    setSelectedStatuses(statuses);
    
    // Update filters with the new status selection
    startTransition(() => {
      setFilters(prevFilters => ({
        ...prevFilters,
        status: statuses.length > 0 ? statuses.join(',') : undefined,
        page: 1
      }));
    });
  }, []);

  // Clear individual filter handler
  const clearIndividualFilter = useCallback((filterKey: string) => {
    startTransition(() => {
      switch (filterKey) {
        case 'status':
          setSelectedStatuses([]);
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

  // Clear all filters handler
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
      setSelectedStatuses([]);
    });
  }, []);

  // Check if there are active filters
  const hasActiveFilters = useMemo(() => {
    return !!(
      searchInput ||
      filters.category ||
      filters.tag ||
      filters.author ||
      selectedStatuses.length > 0 ||
      (filters.sortBy && filters.sortBy !== 'createdAt') ||
      (filters.sortOrder && filters.sortOrder !== 'desc') ||
      (filters.limit && filters.limit !== 10)
    );
  }, [searchInput, filters, selectedStatuses]);

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

  const deletePost = async (postId: string) => {
    const confirmed = await confirmation.confirm({
      title: 'Delete Blog Post',
      message: 'Are you sure you want to delete this blog post? This action cannot be undone.',
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
        },
        onError: (error) => {
          console.error('Error deleting blog posts:', error);
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

  // Sync selectedStatuses with filters.status
  useEffect(() => {
    if (filters.status) {
      const statusArray = filters.status.split(',').filter(Boolean);
      setSelectedStatuses(statusArray);
    } else {
      setSelectedStatuses([]);
    }
  }, [filters.status]);

  return {
    filters,
    searchInput,
    setSearchInput,
    isFilterOpen,
    setIsFilterOpen,
    isPending,
    selectedPosts,
    selectedStatuses,
    
    data,
    isLoading,
    error,
    refetch,
    isDeleting,
    isBulkDeleting,
    
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
    deletePost,
    bulkDeletePosts,
    clearSelectedPosts,
    addNewPost,
    hasActiveFilters,
    handleStatusToggle,
    clearIndividualFilter,
    clearAllFilters,
    
    // Confirmation dialog
    confirmation,
  };
};
