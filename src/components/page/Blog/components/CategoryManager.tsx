import React, { useState, useCallback } from 'react';
import { CategoryFormData } from '@/services/types/subCategoryTypes';
import { useSubCategories } from '@/services/hooks/useSubCategories';
import SubCategoryDropdown from '@/components/form/SubCategoryDropdown';
import Input from '@/components/form/input/InputField';
import TextArea from '@/components/form/input/TextArea';
import Button from '@/components/ui/button/Button';
import Label from '@/components/form/Label';

interface CategoryManagerProps {
  onCategoryCreated?: (category: any) => void;
  onCategoryUpdated?: (category: any) => void;
}

export default function CategoryManager({ onCategoryCreated, onCategoryUpdated }: CategoryManagerProps) {
  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    description: '',
    subCategories: []
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const { 
    subCategories, 
    isLoading, 
    error, 
    createCategory, 
    fetchCategoriesByKeyword 
  } = useSubCategories();

  const showNotification = useCallback((type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  }, []);

  const validateForm = useCallback(() => {
    if (!formData.name.trim()) {
      showNotification('error', 'Category name is required');
      return false;
    }
    return true;
  }, [formData.name, showNotification]);

  const submitCategory = useCallback(async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const categoryData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        subCategories: formData.subCategories.map(sub => ({ name: sub.name.trim() }))
      };

      const createdCategory = await createCategory(categoryData);
      
      showNotification('success', `Category "${formData.name}" created successfully!`);
      
      setFormData({
        name: '',
        description: '',
        subCategories: []
      });

      if (onCategoryCreated) {
        onCategoryCreated(createdCategory);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create category';
      showNotification('error', errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, validateForm, createCategory, showNotification, onCategoryCreated]);

  const updateFormField = useCallback((field: keyof CategoryFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const searchCategories = useCallback(async (keywords: string) => {
    if (keywords.trim()) {
      try {
        await fetchCategoriesByKeyword(keywords);
      } catch (err) {
        showNotification('error', 'Failed to search categories');
      }
    }
  }, [fetchCategoriesByKeyword, showNotification]);

  return (
    <div className="space-y-6">
      {notification && (
        <div className={`p-4 rounded-md ${
          notification.type === 'success' 
            ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200' 
            : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200'
        }`}>
          {notification.message}
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
          Create New Category
        </h2>

        <div className="space-y-4">
          <div>
            <Label htmlFor="categoryName">Category Name *</Label>
            <Input
              id="categoryName"
              type="text"
              placeholder="Enter category name"
              defaultValue={formData.name}
              onChange={(e) => updateFormField('name', e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <div>
            <Label>Description</Label>
            <TextArea
              placeholder="Enter category description (optional)"
              value={formData.description}
              onChange={(value) => updateFormField('description', value)}
              rows={3}
              disabled={isSubmitting}
            />
          </div>

          <div>
            <Label>Subcategories</Label>
            <SubCategoryDropdown
              selectedSubCategories={formData.subCategories}
              availableSubCategories={subCategories}
              onSelectionChange={(selected) => updateFormField('subCategories', selected)}
              placeholder="Search existing subcategories or create new ones..."
              maxSelections={10}
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Type to search existing subcategories or create new ones. Press Enter to add.
            </p>
            {isLoading && (
              <p className="mt-1 text-xs text-blue-500 dark:text-blue-400">
                Loading subcategories...
              </p>
            )}
          </div>

          <div className="flex space-x-3 pt-4">
            <Button
              onClick={submitCategory}
              disabled={isSubmitting || !formData.name.trim()}
              className="flex-1"
            >
              {isSubmitting ? 'Creating...' : 'Create Category'}
            </Button>
            
            <Button
              variant="ghost"
              onClick={() => searchCategories('WEB')}
              disabled={isLoading}
              className="px-6"
            >
              Search Example
            </Button>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 rounded-md">
          <h3 className="font-medium">API Error:</h3>
          <p className="text-sm mt-1">{error}</p>
        </div>
      )}

      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
          API Endpoints Used:
        </h3>
        <div className="text-xs text-gray-600 dark:text-gray-300 space-y-1">
          <div>• GET /api/admin/blogs/sub-category - Fetch all subcategories</div>
          <div>• GET /api/admin/blogs/category?keywords=WEB - Search categories</div>
          <div>• POST /api/admin/blogs/category - Create new category</div>
        </div>
      </div>
    </div>
  );
}
