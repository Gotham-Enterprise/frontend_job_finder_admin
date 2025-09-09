"use client";
import React, { useState } from "react";
import { useModal } from "@/hooks/useModal";
import { useConfirmation } from "@/hooks/useConfirmation";
import { generateSlug } from "@/services/utils";
import { showToast } from "@/services/utils/toast";
import { useBulkDeleteCategories } from "@/services/hooks/useBulkCategories";
import ConfirmationDialog from "@/components/ui/ConfirmationDialog";
import {
  CategoryForm,
  CategoryList,
  CategoryEditModal
} from "./AddCategories/";
import { Category, NewCategory, CategoryOption } from "@/services/types/categoryTypes";
import { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from "@/services/hooks/useCategories";
import { CategoryWithSubCategories } from "@/services/types/subCategoryTypes";

export default function AddNewCategories() {
  const [newCategory, setNewCategory] = useState<NewCategory>({
    name: '',
    slug: '',
    description: '',
    parent: '',
    subCategories: []
  });

  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20); 
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const editModal = useModal();
  const confirmDialog = useConfirmation();
  const filters = {
    ...(searchTerm && { keyword: searchTerm }),
    page: currentPage,
    limit: itemsPerPage
  };
  const { 
    data: categoriesData, 
    isLoading: isLoadingCategories, 
    error: categoriesQueryError,
    refetch: refetchCategories,
    isFetching: isSearching
  } = useCategories(filters);

  const createCategoryMutation = useCreateCategory();
  const updateCategoryMutation = useUpdateCategory();
  const deleteCategoryMutation = useDeleteCategory();
  const bulkDeleteMutation = useBulkDeleteCategories();

  const apiCategories = categoriesData?.categories || [];
  const categoriesError = categoriesQueryError?.message || null;

  const categories = apiCategories.map((apiCategory: CategoryWithSubCategories): Category => ({
    id: apiCategory.id,
    name: apiCategory.name,
    description: apiCategory.description,
    blogCount: apiCategory.blogCount || 0,
    subCategories: apiCategory.subCategories.map(sub => ({ name: sub.name, id: sub.id })),
    createdAt: apiCategory.createdAt,
    updatedAt: apiCategory.updatedAt
  }));

  const initInputChange = (field: keyof NewCategory, value: string) => {
    setNewCategory(prev => {
      const updated = { ...prev, [field]: value };
      
      if (field === 'slug') {
        setIsSlugManuallyEdited(true);
      }

      if (field === 'name' && !isSlugManuallyEdited) {
        updated.slug = generateSlug(value);
      }
      
      return updated;
    });
  };

  const onSubCategoryChange = (subCategories: Array<{ name: string; id?: string }>) => {
    setNewCategory(prev => ({
      ...prev,
      subCategories
    }));
  };

  const addCategory = async () => {
    if (!newCategory.name.trim()) return;

    try {
      const categoryData = {
        name: newCategory.name,
        description: newCategory.description,
        subCategories: newCategory.subCategories?.map(sub => ({ name: sub.name })) || []
      };

      await createCategoryMutation.mutateAsync(categoryData);
      
      setNewCategory({ name: '', slug: '', description: '', parent: '', subCategories: [] });
      setIsSlugManuallyEdited(false); 
    } catch (error) {
      console.error('Failed to create category:', error);
    }
  };

  const editCategory = (category: Category) => {
    setEditingCategory(category);
    editModal.openModal();
  };

  const updateCategory = async () => {
    if (!editingCategory) return;

    try {
      const categoryData = {
        name: editingCategory.name,
        description: editingCategory.description,
        subCategories: editingCategory.subCategories?.map(sub => ({ name: sub.name })) || []
      };

      await updateCategoryMutation.mutateAsync({ 
        categoryId: editingCategory.id, 
        categoryData 
      });
      
      editModal.closeModal();
      setEditingCategory(null);
    } catch (error) {
      console.error('Failed to update category:', error);
    }
  };

  const deleteCategory = async (categoryIds: string[]) => {
    const categoryNames = categoryIds.map(id => {
      const category = categories.find(cat => cat.id === id);
      return category?.name || 'unknown';
    }).join(', ');
    
    const confirmed = await confirmDialog.confirm({
      title: `Delete ${categoryIds.length > 1 ? 'Categories' : 'Category'}`,
      message: `Are you sure you want to delete "${categoryNames}"? This action cannot be undone.`,
      confirmText: 'Delete',
      cancelText: 'Cancel'
    });

    if (confirmed) {
      try {
        await bulkDeleteMutation.mutateAsync(categoryIds);
      } catch (error) {
        console.error('Failed to delete categories:', error);
      }
    }
  };
  const getParentCategoryOptions = (): CategoryOption[] => {
    return [
      { value: '', label: 'None' },
      ...categories
        .filter(cat => cat.id !== editingCategory?.id) 
        .map(cat => ({ value: cat.id, label: cat.name }))
    ];
  };

  const getParentCategoryName = (parentId: string) => {
    const parent = categories.find(cat => cat.id === parentId);
    return parent ? parent.name : '—';
  };

  const searchChange = async (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); 
  };

  const selectCategory = (categoryId: string, selected: boolean) => {
    setSelectedCategories(prev => 
      selected 
        ? [...prev, categoryId]
        : prev.filter(id => id !== categoryId)
    );
  };

  const selectAll = (selected: boolean) => {
    if (selected) {
      setSelectedCategories(categories.map(category => category.id));
    } else {
      setSelectedCategories([]);
    }
  };

  const clearSelection = () => {
    setSelectedCategories([]);
  };

  const bulkDeleteCategories = async () => {
    if (selectedCategories.length === 0) return;
    
    const count = selectedCategories.length;
    const message = count === 1 
      ? 'Are you sure you want to delete this category?' 
      : `Are you sure you want to delete ${count} categories?`;
    
    const confirmed = await confirmDialog.confirm({
      title: 'Delete Categories',
      message,
      confirmText: 'Delete',
      cancelText: 'Cancel'
    });

    if (confirmed) {
      try {
        await bulkDeleteMutation.mutateAsync(selectedCategories);
        setSelectedCategories([]);
        showToast.success('Categories deleted successfully', '');
      } catch (error) {
        console.error('Failed to delete categories:', error);
        showToast.error('Failed to delete categories', '');
      }
    }
  };

  return (
    <div className="mx-auto p-6">
      
      {categoriesError && (
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 rounded-md">
          <h3 className="font-medium">Error loading categories:</h3>
          <p className="text-sm mt-1">{categoriesError}</p>
        </div>
      )}

      <div className="mb-8">
        <h1 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Categories</h1>
        <p className="text-gray-600 dark:text-gray-400">Manage your blog categories</p>
        {isLoadingCategories && (
          <p className="text-sm text-blue-500 dark:text-blue-400 mt-2">Loading categories...</p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
    
        <div className="lg:col-span-1">
          <CategoryForm
            newCategory={newCategory}
            onInputChange={initInputChange}
            onAddCategory={addCategory}
            onSubCategoryChange={onSubCategoryChange}
            isLoading={createCategoryMutation.isPending}
          />
        </div>

        <div className="lg:col-span-2">
          <CategoryList
            categories={categories}
            searchTerm={searchTerm}
            onSearchChange={searchChange}
            onEditCategory={editCategory}
            onDeleteCategory={deleteCategory}
            getParentCategoryName={getParentCategoryName}
            isLoading={isSearching}
            error={categoriesError}
            deletingCategoryIds={bulkDeleteMutation.isPending ? (bulkDeleteMutation.variables || []) : []}
            currentPage={currentPage}
            totalPages={categoriesData?.metaData?.totalPages || 1}
            onPageChange={handlePageChange}
            itemsPerPage={itemsPerPage}
            onItemsPerPageChange={handleItemsPerPageChange}
            selectedCategories={selectedCategories}
            onSelectCategory={selectCategory}
            onSelectAll={selectAll}
            onBulkDelete={bulkDeleteCategories}
            onClearSelection={clearSelection}
            isDeleting={bulkDeleteMutation.isPending}
            metaData={categoriesData?.metaData}
          />
        </div>
      </div>

      <CategoryEditModal
        isOpen={editModal.isOpen}
        onClose={editModal.closeModal}
        editingCategory={editingCategory}
        setEditingCategory={setEditingCategory}
        onUpdateCategory={updateCategory}
        isUpdating={updateCategoryMutation.isPending}
      />

      <ConfirmationDialog
        isOpen={confirmDialog.isOpen}
        onClose={confirmDialog.onClose}
        onConfirm={confirmDialog.onConfirm}
        onCancel={confirmDialog.onCancel}
        title={confirmDialog.config?.title || ''}
        message={confirmDialog.config?.message || ''}
        confirmText={confirmDialog.config?.confirmText}
        cancelText={confirmDialog.config?.cancelText}
        isLoading={deleteCategoryMutation.isPending}
      />
    </div>
  );
}