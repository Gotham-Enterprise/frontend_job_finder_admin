"use client";
import React, { useState } from "react";
import Input from "@/components/form/input/InputField";
import TextArea from "@/components/form/input/TextArea";
import Button from "@/components/ui/button/Button";
import Label from "@/components/form/Label";
import { Table, TableHeader, TableBody, TableRow, TableCell } from "@/components/ui/table";
import { Modal } from "@/components/ui/modal";
import { useModal } from "@/hooks/useModal";

interface Tag {
  id: string;
  name: string;
  slug: string;
  description: string;
  count: number;
}

interface NewTag {
  name: string;
  slug: string;
  description: string;
}

export default function Tags() {
  const [newTag, setNewTag] = useState<NewTag>({
    name: '',
    slug: '',
    description: ''
  });

  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [bulkTags, setBulkTags] = useState('');
  const [showBulkAdd, setShowBulkAdd] = useState(false);
  const editModal = useModal();
  const bulkModal = useModal();

  // Mock data - in real app, this would come from API
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
    }
  ]);

  // Generate slug from name
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleInputChange = (field: keyof NewTag, value: string) => {
    setNewTag(prev => {
      const updated = { ...prev, [field]: value };
      // Auto-generate slug from name if slug field is being updated via name
      if (field === 'name' && !prev.slug) {
        updated.slug = generateSlug(value);
      }
      return updated;
    });
  };

  const handleAddTag = () => {
    if (!newTag.name.trim()) return;

    const tag: Tag = {
      id: Date.now().toString(),
      name: newTag.name,
      slug: newTag.slug || generateSlug(newTag.name),
      description: newTag.description,
      count: 0
    };

    setTags(prev => [...prev, tag]);
    setNewTag({ name: '', slug: '', description: '' });
    console.log('Added tag:', tag);
  };

  const handleBulkAddTags = () => {
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

  const handleEditTag = (tag: Tag) => {
    setEditingTag(tag);
    editModal.openModal();
  };

  const handleUpdateTag = () => {
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

  const handleDeleteTag = (tagId: string) => {
    if (confirm('Are you sure you want to delete this tag?')) {
      setTags(prev => prev.filter(tag => tag.id !== tagId));
      console.log('Deleted tag:', tagId);
    }
  };

  const handleDeleteMultipleTags = () => {
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

  const filteredTags = tags.filter(tag =>
    tag.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tag.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedTags = [...filteredTags].sort((a, b) => b.count - a.count);

  return (
    <div className="mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Tags</h1>
        <p className="text-gray-600 dark:text-gray-400">Manage your blog tags</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Add New Tag Form */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Add New Tag</h2>
            
            <div className="space-y-4">
              <div>
                <Label>Name *</Label>                <Input
                  type="text"
                  placeholder="Tag name"
                  defaultValue={newTag.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                />
              </div>

              <div>
                <Label>Slug</Label>
                <Input
                  type="text"
                  placeholder="tag-slug"
                  defaultValue={newTag.slug}
                  onChange={(e) => handleInputChange('slug', e.target.value)}
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  The "slug" is the URL-friendly version of the name.
                </p>
              </div>

              <div>
                <Label>Description</Label>
                <TextArea
                  placeholder="Tag description (optional)"
                  rows={4}
                  value={newTag.description}
                  onChange={(value) => handleInputChange('description', value)}
                />
              </div>

              <div className="space-y-2">
                <Button
                  variant="default"
                  onClick={handleAddTag}
                  className="w-full"
                  disabled={!newTag.name.trim()}
                >
                  Add New Tag
                </Button>
                
                <Button
                  variant="outline"
                  onClick={bulkModal.openModal}
                  className="w-full dark:text-white"
                >
                  Bulk Add Tags
                </Button>
              </div>
            </div>
          </div>

          {/* Popular Tags */}
          <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Popular Tags</h3>
            <div className="flex flex-wrap gap-2">
              {sortedTags.slice(0, 10).map((tag) => (
                <span
                  key={tag.id}
                  className="inline-flex items-center px-3 py-1 text-sm font-medium text-gray-700 bg-gray-100 rounded-full hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 cursor-pointer transition-colors"
                  onClick={() => handleEditTag(tag)}
                >
                  {tag.name}
                  <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                    {tag.count}
                  </span>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Tags List */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            {/* Search and Actions */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Tags ({tags.length})
                </h2>
                <Button
                  variant="destructive"
                  onClick={handleDeleteMultipleTags}
                  className="text-sm"
                >
                  Delete Selected
                </Button>
              </div>
              
              <div className="relative">                <Input
                  type="text"
                  placeholder="Search tags..."
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

            {/* Tags Table */}
            <div className="overflow-x-auto">
              <Table className="w-full">
                <TableHeader className="bg-gray-50 dark:bg-gray-700">
                  <TableRow>
                    <TableCell isHeader className="px-6 py-3 text-left">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                        onChange={(e) => {
                          const checkboxes = document.querySelectorAll('input[id^="tag-"]') as NodeListOf<HTMLInputElement>;
                          checkboxes.forEach(checkbox => {
                            checkbox.checked = e.target.checked;
                          });
                        }}
                      />
                    </TableCell>
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
                      Posts
                    </TableCell>
                    <TableCell isHeader className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {sortedTags.map((tag) => (
                    <TableRow key={tag.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <TableCell className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          id={`tag-${tag.id}`}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                        />
                      </TableCell>
                      <TableCell className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 mr-3">
                            #{tag.name}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <div className="text-sm text-gray-500 dark:text-gray-400 max-w-xs truncate">
                          {tag.description || '—'}
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500 dark:text-gray-400 font-mono">
                          {tag.slug}
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                          {tag.count}
                        </span>
                      </TableCell>
                      <TableCell className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleEditTag(tag)}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteTag(tag.id)}
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

              {filteredTags.length === 0 && (
                <div className="p-6 text-center">
                  <p className="text-gray-500 dark:text-gray-400">No tags found.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>     
       {/* Edit Tag Modal */}
      <Modal
        isOpen={editModal.isOpen}
        onClose={editModal.closeModal}
        isFullscreen={false}
        className="max-w-2xl mx-auto mt-20 rounded-lg"
      >
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Edit Tag</h3>
          <div className="space-y-4">
            {editingTag && (
              <>                <div>
                  <Label htmlFor="editTagName">Name *</Label>
                  <Input
                    id="editTagName"
                    type="text"
                    placeholder="Tag name"
                    defaultValue={editingTag.name}
                    onChange={(e) => setEditingTag(prev => prev ? { ...prev, name: e.target.value } : null)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="editTagSlug">Slug</Label>
                  <Input
                    id="editTagSlug"
                    type="text"
                    placeholder="tag-slug"
                    defaultValue={editingTag.slug}
                    onChange={(e) => setEditingTag(prev => prev ? { ...prev, slug: e.target.value } : null)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="editTagDescription">Description</Label>
                  <TextArea
                    placeholder="Tag description (optional)"
                    rows={4}
                    value={editingTag.description}
                    onChange={(value) => setEditingTag(prev => prev ? { ...prev, description: value } : null)}
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
                  <Button onClick={handleUpdateTag}>
                    Update Tag
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </Modal>      
      <Modal
        isOpen={bulkModal.isOpen}
        onClose={bulkModal.closeModal}
        isFullscreen={false}
        className="max-w-2xl mx-auto mt-20 rounded-lg"
      >
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Bulk Add Tags</h3>
          <div className="space-y-4">
            <div>
              <Label htmlFor="bulkTags">Tags</Label>
              <TextArea
                placeholder="Enter tags separated by commas or new lines&#10;e.g., React, TypeScript, CSS&#10;or&#10;React&#10;TypeScript&#10;CSS"
                rows={8}
                value={bulkTags}
                onChange={(value) => setBulkTags(value)}
              />
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Separate tags with commas or put each tag on a new line.
              </p>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button
                variant="ghost"
                onClick={bulkModal.closeModal}
                className="dark:text-white"
              >
                Cancel
              </Button>
              <Button
                onClick={handleBulkAddTags}
                disabled={!bulkTags.trim()}
              >
                Add Tags
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}