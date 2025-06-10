import React from 'react';

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  parent: string;
  count: number;
}

export interface NewCategory {
  name: string;
  slug: string;
  description: string;
  parent: string;
}

export interface CategoryOption {
  value: string;
  label: string;
}

export interface CategoryFormProps {
  newCategory: NewCategory;
  onInputChange: (field: keyof NewCategory, value: string) => void;
  onAddCategory: () => void;
  parentOptions: CategoryOption[];
}

export interface CategoryListProps {
  categories: Category[];
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onEditCategory: (category: Category) => void;
  onDeleteCategory: (categoryId: string) => void;
  getParentCategoryName: (parentId: string) => string;
}

export interface CategoryEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingCategory: Category | null;
  setEditingCategory: React.Dispatch<React.SetStateAction<Category | null>>;
  onUpdateCategory: () => void;
  parentOptions: CategoryOption[];
}
