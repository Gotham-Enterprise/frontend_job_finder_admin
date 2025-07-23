"use client";
import React from "react";
import { Table, TableHeader, TableBody, TableRow, TableCell } from "@/components/ui/table";
import { Tag } from "@/services/api/tag";
import { TrashBinIcon, PencilIcon } from "@/icons";

interface TagListProps {
  tags: Tag[];
  searchTerm: string;
  selectedTags: string[];
  onSearchChange: (value: string) => void;
  onEditTag: (tag: Tag) => void;
  onDeleteTag: (tagId: string) => void;
  onToggleSelection: (tagId: string, selected: boolean) => void;
  isDeleting?: boolean;
}

const TagList: React.FC<TagListProps> = ({
  tags,
  searchTerm,
  selectedTags,
  onSearchChange,
  onEditTag,
  onDeleteTag,
  onToggleSelection,
  isDeleting = false
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="overflow-x-auto">
      <Table className="w-full">
        <TableHeader className="bg-gray-50 dark:bg-gray-700">
          <TableRow>
            <TableCell isHeader className="px-6 py-3 text-left w-12">
              <input
                type="checkbox"
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                checked={selectedTags.length === tags.length && tags.length > 0}
                onChange={(e) => {
                  const allTagIds = tags.map(tag => tag.id);
                  if (e.target.checked) {
                    allTagIds.forEach(id => {
                      if (!selectedTags.includes(id)) {
                        onToggleSelection(id, true);
                      }
                    });
                  } else {
                    selectedTags.forEach(id => onToggleSelection(id, false));
                  }
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
              Created At
            </TableCell>
            <TableCell isHeader className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Actions
            </TableCell>
          </TableRow>
        </TableHeader>
        <TableBody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
          {tags.map((tag) => (
            <TableRow key={tag.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
              <TableCell className="px-6 py-4 whitespace-nowrap">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                  checked={selectedTags.includes(tag.id)}
                  onChange={(e) => onToggleSelection(tag.id, e.target.checked)}
                />
              </TableCell>
              <TableCell className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
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
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {formatDate(tag.createdAt)}
                </div>
              </TableCell>
              <TableCell className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex items-center justify-end space-x-2">
                  <button
                    onClick={() => onEditTag(tag)}
                    className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 p-1 rounded transition-colors"
                    title="Edit tag"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => onDeleteTag(tag.id)}
                    disabled={isDeleting}
                    className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 p-1 rounded transition-colors disabled:opacity-50"
                    title="Delete tag"
                  >
                    <TrashBinIcon className="h-4 w-4" />
                  </button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {tags.length === 0 && (
        <div className="p-6 text-center">
          <p className="text-gray-500 dark:text-gray-400">No tags found.</p>
        </div>
      )}
    </div>
  );
};

export default TagList;
