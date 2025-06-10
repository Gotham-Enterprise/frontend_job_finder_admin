"use client";
import React, { useState } from "react";
import { useModal } from "@/hooks/useModal";
import { generateSlug } from "@/services/utils";
import {
  TagForm,
  TagList,
  PopularTags,
  TagEditModal,
  BulkAddModal
} from "./Tags/";
import { Tag, NewTag } from "@/services/types/tagTypes";

export default function Tags() {
  const [newTag, setNewTag] = useState<NewTag>({
    name: '',
    slug: '',
    description: ''
  });

  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [bulkTags, setBulkTags] = useState('');
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);
  const editModal = useModal();
  const bulkModal = useModal();

  const [tags, setTags] = useState<Tag[]>([
    {
      id: '1',
      name: 'React',
      slug: 'react',
      description: 'JavaScript library for building user interfaces',
      count: 25
    },
    {
      id: '2',
      name: 'TypeScript',
      slug: 'typescript',
      description: 'Typed superset of JavaScript',
      count: 18
    },
    {
      id: '3',
      name: 'Next.js',
      slug: 'nextjs',
      description: 'React framework for production',
      count: 12
    },
    {
      id: '4',
      name: 'CSS',
      slug: 'css',
      description: 'Cascading Style Sheets',
      count: 20
    },
    {
      id: '5',
      name: 'JavaScript',
      slug: 'javascript',
      description: 'Programming language for the web',
      count: 30
    },
    {
      id: '6',
      name: 'Node.js',
      slug: 'nodejs',
      description: 'JavaScript runtime for server-side development',
      count: 15
    }  ]);

  const initInputChange = (field: keyof NewTag, value: string) => {
    setNewTag(prev => {
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

  const addTag = () => {
    if (!newTag.name.trim()) return;

    const tag: Tag = {
      id: Date.now().toString(),
      name: newTag.name,
      slug: newTag.slug || generateSlug(newTag.name),
      description: newTag.description,
      count: 0
    };    setTags(prev => [...prev, tag]);
    setNewTag({ name: '', slug: '', description: '' });
    setIsSlugManuallyEdited(false); 
  };

  const bulkAddTags = () => {
    if (!bulkTags.trim()) return;

    const tagNames = bulkTags
      .split(/[,\n]/)
      .map(name => name.trim())
      .filter(name => name.length > 0);

    const newTagsArray: Tag[] = tagNames.map(name => ({
      id: Date.now().toString() + Math.random(),
      name,
      slug: generateSlug(name),
      description: '',
      count: 0
    }));

    setTags(prev => [...prev, ...newTagsArray]);
    setBulkTags('');
    bulkModal.closeModal();
    console.log('Added bulk tags:', newTagsArray);
  };

  const editTag = (tag: Tag) => {
    setEditingTag(tag);
    editModal.openModal();
  };

  const updateTag = () => {
    if (!editingTag) return;

    setTags(prev =>
      prev.map(tag =>
        tag.id === editingTag.id ? editingTag : tag
      )
    );
    editModal.closeModal();
    setEditingTag(null);
    console.log('Updated tag:', editingTag);
  };

  const deleteTag = (tagId: string) => {
    if (confirm('Are you sure you want to delete this tag?')) {
      setTags(prev => prev.filter(tag => tag.id !== tagId));
      
    }
  };

  const deleteMultipleTags = () => {
    const selectedTags = tags.filter(tag => (document.getElementById(`tag-${tag.id}`) as HTMLInputElement)?.checked);
    if (selectedTags.length === 0) {
      alert('Please select tags to delete.');
      return;
    }

    if (confirm(`Are you sure you want to delete ${selectedTags.length} tag(s)?`)) {
      const selectedIds = selectedTags.map(tag => tag.id);
      setTags(prev => prev.filter(tag => !selectedIds.includes(tag.id)));
      console.log('Deleted multiple tags:', selectedIds);
    }
  };

  return (
    <div className="mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Tags</h1>
        <p className="text-gray-600 dark:text-gray-400">Manage your blog tags</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <TagForm
            newTag={newTag}
            onInputChange={initInputChange}
            onAddTag={addTag}
            onBulkModalOpen={bulkModal.openModal}
          />

          <PopularTags
            tags={tags}
            onEditTag={editTag}
          />
        </div>
        <div className="lg:col-span-2">
          <TagList
            tags={tags}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            onEditTag={editTag}
            onDeleteTag={deleteTag}
            onDeleteMultipleTags={deleteMultipleTags}
          />
        </div>
      </div>
      <TagEditModal
        isOpen={editModal.isOpen}
        onClose={editModal.closeModal}
        editingTag={editingTag}
        setEditingTag={setEditingTag}
        onUpdateTag={updateTag}
      />
      <BulkAddModal
        isOpen={bulkModal.isOpen}
        onClose={bulkModal.closeModal}
        bulkTags={bulkTags}
        setBulkTags={setBulkTags}
        onBulkAddTags={bulkAddTags}
      />
    </div>
  );
}