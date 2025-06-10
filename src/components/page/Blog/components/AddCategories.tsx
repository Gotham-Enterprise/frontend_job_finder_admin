"use client";
import React, { useState } from "react";
import { useModal } from "@/hooks/useModal";
import { generateSlug } from "@/services/utils";
import {
  CategoryForm,
  CategoryList,
  CategoryEditModal
} from "./AddCategories/";
import { Category, NewCategory, CategoryOption } from "@/services/types/categoryTypes";

export default function AddNewCategories() {
  const [newCategory, setNewCategory] = useState<NewCategory>({
    name: '',
    slug: '',
    description: '',
    parent: ''
  });

  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);
  const editModal = useModal();


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
    }  ]);

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

  const addCategory = () => {
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
    setIsSlugManuallyEdited(false); 
    console.log('Added category:', category);
  };

  const editCategory = (category: Category) => {
    setEditingCategory(category);
    editModal.openModal();
  };

  const updateCategory = () => {
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

  const deleteCategory = (categoryId: string) => {
    if (confirm('Are you sure you want to delete this category?')) {
      setCategories(prev => prev.filter(cat => cat.id !== categoryId));
      console.log('Deleted category:', categoryId);
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

  const searchChange = (value: string) => {
    setSearchTerm(value);
  };

  return (
    <div className="mx-auto p-6">
    
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Categories</h1>
        <p className="text-gray-600 dark:text-gray-400">Manage your blog categories</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
    
        <div className="lg:col-span-1">
          <CategoryForm
            newCategory={newCategory}
            onInputChange={initInputChange}
            onAddCategory={addCategory}
            parentOptions={getParentCategoryOptions()}
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
          />
        </div>
      </div>

      <CategoryEditModal
        isOpen={editModal.isOpen}
        onClose={editModal.closeModal}
        editingCategory={editingCategory}
        setEditingCategory={setEditingCategory}
        onUpdateCategory={updateCategory}
        parentOptions={getParentCategoryOptions()}
      />
    </div>
  );
}