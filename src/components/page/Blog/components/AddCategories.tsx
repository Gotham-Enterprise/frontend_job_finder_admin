"use client";
import React, { useState } from "react";
import Input from "@/components/form/input/InputField";
import TextArea from "@/components/form/input/TextArea";
import Button from "@/components/ui/button/Button";
import Label from "@/components/form/Label";
import Select from "@/components/form/Select";
import { Table, TableHeader, TableBody, TableRow, TableCell } from "@/components/ui/table";
import { Modal } from "@/components/ui/modal";
import { useModal } from "@/hooks/useModal";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  parent: string;
  count: number;
}

interface NewCategory {
  name: string;
  slug: string;
  description: string;
  parent: string;
}

export default function AddNewCategories() {
  const [newCategory, setNewCategory] = useState<NewCategory>({
    name: '',
    slug: '',
    description: '',
    parent: ''
  });

  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const editModal = useModal();

  // Mock data - in real app, this would come from API
  const [categories, setCategories] = useState<Category[]>([
    {
      id: '1',
      name: 'Technology',
      slug: 'technology',
      description: 'Posts about technology and innovation',
      parent: '',
      count: 12
    },
    {
      id: '2',
      name: 'Web Development',
      slug: 'web-development',
      description: 'Frontend and backend development topics',
      parent: '1',
      count: 8
    },
    {
      id: '3',
      name: 'Design',
      slug: 'design',
      description: 'UI/UX and graphic design content',
      parent: '',
      count: 15
    },
    {
      id: '4',
      name: 'Business',
      slug: 'business',
      description: 'Business strategies and entrepreneurship',
      parent: '',
      count: 6
    },
    {
      id: '5',
      name: 'Marketing',
      slug: 'marketing',
      description: 'Digital marketing and advertising',
      parent: '4',
      count: 9
    }
  ]);

  // Generate slug from name
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleInputChange = (field: keyof NewCategory, value: string) => {
    setNewCategory(prev => {
      const updated = { ...prev, [field]: value };
      // Auto-generate slug from name if slug field is being updated via name
      if (field === 'name' && !prev.slug) {
        updated.slug = generateSlug(value);
      }
      return updated;
    });
  };

  const handleAddCategory = () => {
    if (!newCategory.name.trim()) return;

    const category: Category = {
      id: Date.now().toString(),
      name: newCategory.name,
      slug: newCategory.slug || generateSlug(newCategory.name),
      description: newCategory.description,
      parent: newCategory.parent,
      count: 0
    };

    setCategories(prev => [...prev, category]);
    setNewCategory({ name: '', slug: '', description: '', parent: '' });
    console.log('Added category:', category);
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    editModal.openModal();
  };

  const handleUpdateCategory = () => {
    if (!editingCategory) return;

    setCategories(prev =>
      prev.map(cat =>
        cat.id === editingCategory.id ? editingCategory : cat
      )
    );
    editModal.closeModal();
    setEditingCategory(null);
    console.log('Updated category:', editingCategory);
  };

  const handleDeleteCategory = (categoryId: string) => {
    if (confirm('Are you sure you want to delete this category?')) {
      setCategories(prev => prev.filter(cat => cat.id !== categoryId));
      console.log('Deleted category:', categoryId);
    }
  };

  const getParentCategoryOptions = () => {
    return [
      { value: '', label: 'None' },
      ...categories
        .filter(cat => cat.id !== editingCategory?.id) // Prevent self-parent
        .map(cat => ({ value: cat.id, label: cat.name }))
    ];
  };

  const getParentCategoryName = (parentId: string) => {
    const parent = categories.find(cat => cat.id === parentId);
    return parent ? parent.name : '—';
  };

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Categories</h1>
        <p className="text-gray-600 dark:text-gray-400">Manage your blog categories</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Add New Category Form */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Add New Category</h2>
            
            <div className="space-y-4">
              <div>
                <Label>Name *</Label>                <Input
                  type="text"
                  placeholder="Category name"
                  defaultValue={newCategory.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                />
              </div>

              <div>
                <Label>Slug</Label>                <Input
                  type="text"
                  placeholder="category-slug"
                  defaultValue={newCategory.slug}
                  onChange={(e) => handleInputChange('slug', e.target.value)}
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  The "slug" is the URL-friendly version of the name.
                </p>
              </div>

              <div>
                <Label>Parent Category</Label>
                <Select
                  options={getParentCategoryOptions()}
                  placeholder="None"
                  defaultValue={newCategory.parent}
                  onChange={(value) => handleInputChange('parent', value)}
                />
              </div>

              <div>
                <Label>Description</Label>
                <TextArea
                  placeholder="Category description (optional)"
                  rows={4}
                  value={newCategory.description}
                  onChange={(value) => handleInputChange('description', value)}
                />
              </div>

              <Button
                variant="default"
                onClick={handleAddCategory}
                className="w-full"
                disabled={!newCategory.name.trim()}
              >
                Add New Category
              </Button>
            </div>
          </div>
        </div>

        {/* Categories List */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            {/* Search and Header */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Categories ({categories.length})
                </h2>
              </div>
              
              <div className="relative">                <Input
                  type="text"
                  placeholder="Search categories..."
                  defaultValue={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Categories Table */}
            <div className="overflow-x-auto">
              <Table className="w-full">
                <TableHeader className="bg-gray-50 dark:bg-gray-700">
                  <TableRow>
                    <TableCell isHeader className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Name
                    </TableCell>
                    <TableCell isHeader className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Description
                    </TableCell>
                    <TableCell isHeader className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Slug
                    </TableCell>
                    <TableCell isHeader className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Parent
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
                  {filteredCategories.map((category) => (
                    <TableRow key={category.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
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
                      <TableCell className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500 dark:text-gray-400 font-mono">
                          {category.slug}
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {getParentCategoryName(category.parent)}
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                          {category.count}
                        </span>
                      </TableCell>
                      <TableCell className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleEditCategory(category)}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteCategory(category.id)}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                          >
                            Delete
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {filteredCategories.length === 0 && (
                <div className="p-6 text-center">
                  <p className="text-gray-500 dark:text-gray-400">No categories found.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>      {/* Edit Category Modal */}
      <Modal
        isOpen={editModal.isOpen}
        onClose={editModal.closeModal}
        isFullscreen={false}
        className="max-w-2xl mx-auto mt-20 rounded-lg"
      >
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Edit Category</h3>
          <div className="space-y-4">
            {editingCategory && (
              <>
                <div>
                  <Label htmlFor="editCategoryName">Name *</Label>
                  <Input
                    id="editCategoryName"
                    type="text"
                    placeholder="Category name"
                    value={editingCategory.name}
                    onChange={(e) => setEditingCategory(prev => prev ? { ...prev, name: e.target.value } : null)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="editCategorySlug">Slug</Label>
                  <Input
                    id="editCategorySlug"
                    type="text"
                    placeholder="category-slug"
                    value={editingCategory.slug}
                    onChange={(e) => setEditingCategory(prev => prev ? { ...prev, slug: e.target.value } : null)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="editCategoryParent">Parent Category</Label>
                  <Select
                    options={getParentCategoryOptions()}
                    placeholder="None"
                    defaultValue={editingCategory.parent}
                    onChange={(value) => setEditingCategory(prev => prev ? { ...prev, parent: value } : null)}
                  />
                </div>

                <div>
                  <Label htmlFor="editCategoryDescription">Description</Label>
                  <TextArea
                    placeholder="Category description (optional)"
                    rows={4}
                    value={editingCategory.description}
                    onChange={(value) => setEditingCategory(prev => prev ? { ...prev, description: value } : null)}
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <Button
                    variant="ghost"
                    onClick={editModal.closeModal}
                    className="dark:text-white"
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleUpdateCategory}>
                    Update Category
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
}