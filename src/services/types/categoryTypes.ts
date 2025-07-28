import React from 'react';

export interface Category {
  id: string;
  name: string;
  description: string;
  blogCount: number;
  subCategories: Array<{ 
    id: string; 
    name: string; 
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface NewCategory {
  name: string;
  slug: string;
  description: string;
  parent: string;
  subCategories?: Array<{ name: string; id?: string }>;
}

export interface CategoryOption {
  value: string;
  label: string;
}

export interface CategoryFormProps {
  newCategory: NewCategory;
  onInputChange: (field: keyof NewCategory, value: string) => void;
  onAddCategory: () => void;
  onSubCategoryChange?: (subCategories: Array<{ name: string; id?: string }>) => void;
  isLoading?: boolean;
}

export interface CategoryListProps {
  categories: Category[];
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onEditCategory: (category: Category) => void;
  onDeleteCategory: (categoryIds: string[]) => void;
  getParentCategoryName: (parentId: string) => string;
  isLoading?: boolean;
  error?: string | null;
  deletingCategoryIds?: string[];
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  itemsPerPage?: number;
  onItemsPerPageChange?: (itemsPerPage: number) => void;
  selectedCategories?: string[];
  onSelectCategory?: (categoryId: string, selected: boolean) => void;
  onSelectAll?: (selected: boolean) => void;
  onBulkDelete?: () => void;
  onClearSelection?: () => void;
  isDeleting?: boolean;
}

export interface CategoryEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingCategory: Category | null;
  setEditingCategory: React.Dispatch<React.SetStateAction<Category | null>>;
  onUpdateCategory: () => void;
  isUpdating?: boolean;
}
