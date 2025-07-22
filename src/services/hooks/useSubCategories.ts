import { useMemo } from 'react';
import { useCategories } from './useCategories';
import { SubCategory, CategoryWithSubCategories } from '@/services/types/subCategoryTypes';

/**
 * Extracts subcategories from categories data
 * @param categories - Array of categories with subcategories
 * @returns Array of unique subcategories
 */
const extractSubCategories = (categories: CategoryWithSubCategories[]): SubCategory[] => {
  if (!categories || categories.length === 0) {
    return [];
  }

  const subCategoriesMap = new Map<string, SubCategory>();

  categories.forEach((category) => {
    if (category.subCategories && Array.isArray(category.subCategories)) {
      category.subCategories.forEach((subCategory: SubCategory) => {
        if (subCategory.id && subCategory.name) {
          subCategoriesMap.set(subCategory.id, {
            id: subCategory.id,
            name: subCategory.name,
            createdAt: subCategory.createdAt,
            updatedAt: subCategory.updatedAt,
          });
        }
      });
    }
  });

  return Array.from(subCategoriesMap.values());
};

/**
 * Hook to get subcategories from categories data
 * @returns Object containing subcategories data and loading state
 */
export const useSubCategories = () => {
  const { data: categoriesData, isLoading, error } = useCategories();

  const subCategories = useMemo(() => {
    if (!categoriesData?.categories) {
      return [];
    }
    return extractSubCategories(categoriesData.categories);
  }, [categoriesData?.categories]);

  return {
    subCategories,
    isLoading,
    error,
  };
};
