import React from "react";
import Input from "@/components/form/input/InputField";
import Checkbox from "@/components/form/input/Checkbox";
import { Table, TableHeader, TableBody, TableRow, TableCell } from "@/components/ui/table";
import Pagination from "@/components/tables/Pagination";
import BulkActionDropdown from "@/components/ui/BulkActionDropdown";
import { CategoryListProps } from "@/services/types/categoryTypes";
import Button from '../../../../ui/button/Button';
import { PencilIcon, TrashBinIcon } from '@/icons';
import FullScreenSpinner from '@/components/ui/FullScreenSpinner';

export default function CategoryList({
  categories,
  searchTerm,
  onSearchChange,
  onEditCategory,
  onDeleteCategory,
  getParentCategoryName,
  isLoading = false,
  error = null,
  deletingCategoryIds = [],
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  itemsPerPage = 10,
  onItemsPerPageChange,
  selectedCategories = [],
  onSelectCategory,
  onSelectAll,
  onBulkDelete,
  onClearSelection,
  isDeleting = false,
}: CategoryListProps) {
  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedCategories = filteredCategories.slice(startIndex, endIndex);
  const calculatedTotalPages = Math.ceil(filteredCategories.length / itemsPerPage);

  return (
    <>
      <FullScreenSpinner 
        isVisible={isDeleting} 
        message="Deleting category..." 
      />
      
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Categories ({categories.length})
          </h2>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Input
              type="text"
              placeholder="Search categories..."
              defaultValue={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {onBulkDelete && onClearSelection && (
            <BulkActionDropdown
              selectedItems={selectedCategories || []}
              itemType="categories"
              onBulkDelete={onBulkDelete}
              onClearSelection={onClearSelection}
              isDeleting={isDeleting}
            />
          )}
        </div>
        
        {isLoading && (
          <p className="text-sm text-blue-500 dark:text-blue-400 mt-2">Loading categories...</p>
        )}
        
        {error && (
          <div className="mt-2 p-3 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 rounded-md">
            <p className="text-sm">{error}</p>
          </div>
        )}
      </div>

      <div className="overflow-x-auto">
        <Table className="w-full">
          <TableHeader className="bg-gray-50 dark:bg-gray-700">
            <TableRow>
              {onSelectCategory && onSelectAll && (
                <TableCell isHeader className="px-6 py-3 w-12">
                  <Checkbox
                    checked={selectedCategories.length === paginatedCategories.length && paginatedCategories.length > 0}
                    onChange={(checked) => onSelectAll(checked)}
                  />
                </TableCell>
              )}
              <TableCell isHeader className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Name
              </TableCell>
              <TableCell isHeader className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Description
              </TableCell>
            
              <TableCell isHeader className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Subcategories
              </TableCell>
              <TableCell isHeader className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Posts
              </TableCell>
              <TableCell isHeader className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Actions
              </TableCell>
            </TableRow>
          </TableHeader>
          <TableBody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {paginatedCategories.map((category) => (
              <TableRow key={category.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                {onSelectCategory && (
                  <TableCell className="px-6 py-4 w-12">
                    <Checkbox
                      checked={selectedCategories.includes(category.id)}
                      onChange={(checked) => onSelectCategory(category.id, checked)}
                    />
                  </TableCell>
                )}
                <TableCell className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {category.name}
                  </div>
                </TableCell>
                <TableCell className="px-6 py-4">
                  <div className="text-sm text-gray-500 dark:text-gray-400 max-w-xs truncate">
                    {category.description || '—'}
                  </div>
                </TableCell>
             
                <TableCell className="px-6 py-4">
                  <div className="flex flex-wrap gap-1">
                    {category.subCategories && category.subCategories.length > 0 ? (
                      category.subCategories.slice(0, 3).map((subCat, index) => (
                        <span
                          key={subCat.id || index}
                          className="inline-flex items-center px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-medium rounded-full"
                        >
                          {subCat.name}
                        </span>
                      ))
                    ) : (
                      <span className="text-gray-400 dark:text-gray-500 text-xs">—</span>
                    )}
                    {category.subCategories && category.subCategories.length > 3 && (
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        +{category.subCategories.length - 3} more
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                    {category.count}
                  </span>
                </TableCell>
                <TableCell className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end gap-2">
                      <Button 
                      variant="ghost" 
                      size="sm" 
                      disabled={deletingCategoryIds.includes(category.id)}
                      className="text-brand-400"
                     onClick={() => onEditCategory(category)}
                      startIcon={<PencilIcon />}
                    >
                      Edit
                    </Button>
                  
                      <Button 
                      variant="ghost" 
                      size="sm" 
                      disabled={deletingCategoryIds.includes(category.id)}
                      className="text-red-600 hover:text-red-700"
                      onClick={() => onDeleteCategory([category.id])}
                      startIcon={<TrashBinIcon />}
                    >
                      Delete
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {paginatedCategories.length === 0 && filteredCategories.length === 0 && (
          <div className="p-6 text-center">
            <p className="text-gray-500 dark:text-gray-400">No categories found.</p>
          </div>
        )}
      </div>

      {filteredCategories.length > 0 && onPageChange && (
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
          
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-700 dark:text-gray-300">Items per page:</span>
              <select
                value={itemsPerPage}
                onChange={(e) => onItemsPerPageChange?.(Number(e.target.value))}
                className="rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-1 text-sm text-gray-900 dark:text-white focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
              </select>
            </div>
            
  
            {calculatedTotalPages > 1 ? (
              <Pagination
                currentPage={currentPage}
                totalPages={calculatedTotalPages}
                onPageChange={onPageChange}
              />
            ) : (
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Showing {filteredCategories.length} of {filteredCategories.length} items
              </div>
            )}
          </div>
        </div>
      )}
    </div>
    </>
  );
}
