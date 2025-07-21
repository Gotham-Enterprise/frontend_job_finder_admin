import React, { memo, useCallback } from 'react';
import { ColumnBlock } from '@/services/types/visualLayoutTypes';

interface ColumnSettingsProps {
  block: ColumnBlock;
  onContentUpdate: (field: string, value: any) => void;
  onStyleUpdate?: (field: string, value: any) => void;
}

interface SelectFieldProps {
  label: string;
  value: string | number;
  onChange: (value: any) => void;
  options: readonly { value: any; label: string }[];
  className?: string;
}

const SelectField: React.FC<SelectFieldProps> = memo(({ 
  label, 
  value, 
  onChange, 
  options, 
  className = "w-full" 
}) => (
  <div className={className}>
    <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 focus:border-purple-400 focus:outline-none focus:ring-1 focus:ring-purple-100 transition-all"
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </div>
));

SelectField.displayName = 'SelectField';

const COLUMN_COUNTS = [
  { value: 1, label: '1 Column' },
  { value: 2, label: '2 Columns' },
] as const;

const CONTENT_TYPES = [
  { value: 'text', label: 'Text' },
  { value: 'image', label: 'Image' },
  { value: 'video', label: 'Video' },
  { value: 'list', label: 'List' }
] as const;

const LIST_TYPES = [
  { value: 'ordered', label: 'Numbered List' },
  { value: 'unordered', label: 'Bullet List' }
] as const;

const ColumnSettings: React.FC<ColumnSettingsProps> = memo(({ 
  block, 
  onContentUpdate 
}) => {
  const generateColumnId = useCallback(() => `col-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, []);

  const updateColumnCount = useCallback((count: number) => {
    const currentColumns = block.content.columns || [];
    const newColumns = [...currentColumns];

    if (count > currentColumns.length) {
      for (let i = currentColumns.length; i < count; i++) {
        newColumns.push({
          id: generateColumnId(),
          contentType: 'text' as const,
          content: {
            text: `Column ${i + 1} content...`,
          },
        });
      }
    } else if (count < currentColumns.length) {
      newColumns.splice(count);
    }

    onContentUpdate('columnCount', count);
    onContentUpdate('columns', newColumns);
  }, [block.content.columns, onContentUpdate, generateColumnId]);

  const updateColumnContentType = useCallback((columnIndex: number, contentType: 'text' | 'image' | 'video' | 'list') => {
    const newColumns = [...block.content.columns];
    const defaultContent = {
      text: contentType === 'text' ? `Column ${columnIndex + 1} content...` : undefined,
      url: contentType !== 'text' && contentType !== 'list' ? '' : undefined,
      alt: contentType === 'image' ? `Column ${columnIndex + 1} image` : undefined,
      title: contentType === 'video' ? `Column ${columnIndex + 1} video` : undefined,
      listItems: contentType === 'list' ? [`Item 1`, `Item 2`, `Item 3`] : undefined,
      listType: contentType === 'list' ? 'unordered' as const : undefined,
    };

    newColumns[columnIndex] = {
      ...newColumns[columnIndex],
      contentType,
      content: defaultContent,
    };

    onContentUpdate('columns', newColumns);
  }, [block.content.columns, onContentUpdate]);

  const updateColumnContent = useCallback((columnIndex: number, field: string, value: string) => {
    const newColumns = [...block.content.columns];
    newColumns[columnIndex] = {
      ...newColumns[columnIndex],
      content: {
        ...newColumns[columnIndex].content,
        [field]: value,
      },
    };

    onContentUpdate('columns', newColumns);
  }, [block.content.columns, onContentUpdate]);

  const updateListItems = useCallback((columnIndex: number, items: string[]) => {
    const newColumns = [...block.content.columns];
    newColumns[columnIndex] = {
      ...newColumns[columnIndex],
      content: {
        ...newColumns[columnIndex].content,
        listItems: items,
      },
    };

    onContentUpdate('columns', newColumns);
  }, [block.content.columns, onContentUpdate]);

  const addListItem = useCallback((columnIndex: number) => {
    const currentItems = block.content.columns[columnIndex].content.listItems || [];
    const newItems = [...currentItems, `Item ${currentItems.length + 1}`];
    updateListItems(columnIndex, newItems);
  }, [block.content.columns, updateListItems]);

  const removeListItem = useCallback((columnIndex: number, itemIndex: number) => {
    const currentItems = block.content.columns[columnIndex].content.listItems || [];
    const newItems = currentItems.filter((_, index) => index !== itemIndex);
    updateListItems(columnIndex, newItems);
  }, [block.content.columns, updateListItems]);

  const updateListItemText = useCallback((columnIndex: number, itemIndex: number, text: string) => {
    const currentItems = block.content.columns[columnIndex].content.listItems || [];
    const newItems = [...currentItems];
    newItems[itemIndex] = text;
    updateListItems(columnIndex, newItems);
  }, [block.content.columns, updateListItems]);

  const updateGap = useCallback((gap: number) => {
    onContentUpdate('gap', gap);
  }, [onContentUpdate]);

  return (
    <div className="space-y-4">
      <SelectField
        label="Number of Columns"
        value={block.content.columnCount}
        onChange={updateColumnCount}
        options={COLUMN_COUNTS}
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Column Gap (px)</label>
        <input
          type="number"
          value={block.content.gap || 16}
          onChange={(e) => updateGap(parseInt(e.target.value))}
          min="0"
          max="64"
          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100 transition-all"
        />
      </div>

      <div className="space-y-3">
        <h4 className="text-sm font-medium text-gray-700">Column Content</h4>
        
        {block.content.columns.map((column, index) => (
          <div key={column.id} className="p-4 bg-gray-50 rounded-lg border space-y-3">
            <div className="flex items-center justify-between">
              <h5 className="text-sm font-medium text-gray-600">Column {index + 1}</h5>
              <SelectField
                label=""
                value={column.contentType}
                onChange={(contentType) => updateColumnContentType(index, contentType)}
                options={CONTENT_TYPES}
                className="w-32"
              />
            </div>

            {column.contentType === 'text' && (
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Text Content</label>
                <textarea
                  value={column.content.text || ''}
                  onChange={(e) => updateColumnContent(index, 'text', e.target.value)}
                  placeholder="Enter text content..."
                  rows={3}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-800 placeholder-gray-400 focus:border-purple-400 focus:outline-none focus:ring-1 focus:ring-purple-100 transition-all resize-none"
                />
              </div>
            )}

            {column.contentType === 'image' && (
              <div className="space-y-2">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Image URL</label>
                  <input
                    type="url"
                    value={column.content.url || ''}
                    onChange={(e) => updateColumnContent(index, 'url', e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-800 placeholder-gray-400 focus:border-purple-400 focus:outline-none focus:ring-1 focus:ring-purple-100 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Alt Text</label>
                  <input
                    type="text"
                    value={column.content.alt || ''}
                    onChange={(e) => updateColumnContent(index, 'alt', e.target.value)}
                    placeholder="Image description"
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-800 placeholder-gray-400 focus:border-purple-400 focus:outline-none focus:ring-1 focus:ring-purple-100 transition-all"
                  />
                </div>
              </div>
            )}

            {column.contentType === 'video' && (
              <div className="space-y-2">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Video URL</label>
                  <input
                    type="url"
                    value={column.content.url || ''}
                    onChange={(e) => updateColumnContent(index, 'url', e.target.value)}
                    placeholder="https://youtube.com/watch?v=..."
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-800 placeholder-gray-400 focus:border-purple-400 focus:outline-none focus:ring-1 focus:ring-purple-100 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Video Title</label>
                  <input
                    type="text"
                    value={column.content.title || ''}
                    onChange={(e) => updateColumnContent(index, 'title', e.target.value)}
                    placeholder="Video title"
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-800 placeholder-gray-400 focus:border-purple-400 focus:outline-none focus:ring-1 focus:ring-purple-100 transition-all"
                  />
                </div>
              </div>
            )}

            {column.contentType === 'list' && (
              <div className="space-y-3">
                <SelectField
                  label="List Type"
                  value={column.content.listType || 'unordered'}
                  onChange={(listType) => updateColumnContent(index, 'listType', listType)}
                  options={LIST_TYPES}
                />
                
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs font-medium text-gray-600">List Items</label>
                    <button
                      type="button"
                      onClick={() => addListItem(index)}
                      className="px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition-colors"
                    >
                      Add Item
                    </button>
                  </div>
                  
                  <div className="space-y-2">
                    {(column.content.listItems || []).map((item, itemIndex) => (
                      <div key={itemIndex} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={item}
                          onChange={(e) => updateListItemText(index, itemIndex, e.target.value)}
                          placeholder={`Item ${itemIndex + 1}`}
                          className="flex-1 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-800 placeholder-gray-400 focus:border-purple-400 focus:outline-none focus:ring-1 focus:ring-purple-100 transition-all"
                        />
                        {(column.content.listItems || []).length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeListItem(index, itemIndex)}
                            className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
});

ColumnSettings.displayName = 'ColumnSettings';

export default ColumnSettings;
