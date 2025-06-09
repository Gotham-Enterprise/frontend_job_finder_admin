import { useState, useMemo, useTransition, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useBlogPosts, useDeleteBlogPost, useBulkDeleteBlogPosts } from '@/services/hooks/useBlog';
import { BlogFilters } from '@/services/types/blog';

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
  const { mutate: deleteBlogPost, isPending: isDeleting } = useDeleteBlogPost();
  const { mutate: bulkDeleteBlogPosts, isPending: isBulkDeleting } = useBulkDeleteBlogPosts();

  const tableColumns = useMemo(() => [
    { key: 'select', label: '', className: 'w-12' },
    { key: 'title', label: 'Title' },
    { key: 'author', label: 'Author' },
    { key: 'categories', label: 'Categories' },
    { key: 'status', label: 'Status' },
    { key: 'publishedDate', label: 'Published' },
    { key: 'comments', label: 'Comments', className: 'text-center' },
    { key: 'views', label: 'Views', className: 'text-center' },
    { key: 'actions', label: '', className: 'text-right' },
  ], []);

  const statusOptions = useMemo(() => [
    { value: '', label: 'All Statuses' },
    { value: 'published', label: 'Published' },
    { value: 'draft', label: 'Draft' },
    { value: 'archived', label: 'Archived' },
  ], []);

  const sortOptions = useMemo(() => [
    { value: 'createdAt-desc', label: 'Newest First' },
    { value: 'createdAt-asc', label: 'Oldest First' },
    { value: 'title-asc', label: 'Title A-Z' },
    { value: 'title-desc', label: 'Title Z-A' },
    { value: 'publishedDate-desc', label: 'Published Date (Newest)' },
    { value: 'publishedDate-asc', label: 'Published Date (Oldest)' },
    { value: 'viewCount-desc', label: 'Most Views' },
    { value: 'viewCount-asc', label: 'Least Views' },
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

  const viewPost = (postId: string) => {
    router.push(`/admin/blog/view/${postId}`);
  };

  const editPost = (postId: string) => {
    router.push(`/admin/blog/edit/${postId}`);
  };

  const deletePost = (postId: string) => {
    if (window.confirm('Are you sure you want to delete this blog post?')) {
      deleteBlogPost(postId, {
        onSuccess: () => {
        
          setSelectedPosts(prev => prev.filter(id => id !== postId));
        }
      });
    }
  };

  const bulkDeletePosts = () => {
    if (selectedPosts.length === 0) return;
    
    const count = selectedPosts.length;
    const message = count === 1 
      ? 'Are you sure you want to delete this blog post?' 
      : `Are you sure you want to delete ${count} blog posts?`;
    
    if (window.confirm(message)) {
      bulkDeleteBlogPosts(selectedPosts, {
        onSuccess: () => {
          setSelectedPosts([]);
        }
      });
    }
  };

  const addNewPost = () => {
    router.push('/admin/blog/add-new');
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
    viewPost,
    editPost,
    deletePost,
    bulkDeletePosts,
    addNewPost,
  };
};
