import React, { useState } from 'react';
import { LayoutBlock } from '../../../../../../services/types/visualLayoutTypes';
import ImageUrlInput from '../ImageUrlInput';
import VideoUrlInput from '../VideoUrlInput';
import { VideoIcon, FileIcon, DocsIcon, GridIcon, PlusIcon, CloseIcon } from '../../../../../../icons';

interface ColumnSettingsPanelProps {
  columnData: LayoutBlock;
  columnIndex: number;
  onUpdate: (field: string, value: any) => void;
  onStyleUpdate: (field: string, value: any) => void;
  onClose: () => void;
  onColumnCountChange?: (count: number) => void;
  currentColumnCount?: number;
}

const CONTENT_TYPES = [
  { type: 'paragraph' as const, label: 'Text', icon: DocsIcon },
  { type: 'image' as const, label: 'Image', icon: FileIcon },
  { type: 'video' as const, label: 'Video', icon: VideoIcon }
];

const MAX_COLUMNS = 4;
const MIN_COLUMNS = 1;

const ColumnSettingsPanel: React.FC<ColumnSettingsPanelProps> = ({
  columnData,
  columnIndex,
  onUpdate,
  onStyleUpdate,
  onClose,
  onColumnCountChange,
  currentColumnCount = 2
}) => {
  const [activeTab, setActiveTab] = useState<'layout' | 'content' | 'style'>('layout');
  
  const contentBlock = columnData.content as LayoutBlock | null;

  const createContentBlock = (type: 'paragraph' | 'image' | 'video'): LayoutBlock => {
    const blocks = {
      paragraph: {
        id: `text-${Date.now()}`,
        type: 'paragraph' as const,
        content: { text: 'Click to edit text' },
        styles: {},
        position: { x: 0, y: 0, width: 100, height: 50 }
      },
      image: {
        id: `image-${Date.now()}`,
        type: 'image' as const,
        content: { url: '', alt: 'Column image' },
        styles: { width: 100, height: 200, widthUnit: '%' as const, heightUnit: 'px' as const },
        position: { x: 0, y: 0, width: 100, height: 200 }
      },
      video: {
        id: `video-${Date.now()}`,
        type: 'video' as const,
        content: { url: '', title: 'Column video' },
        styles: { width: 100, height: 200, widthUnit: '%' as const, heightUnit: 'px' as const },
        position: { x: 0, y: 0, width: 100, height: 200 }
      }
    };
    return blocks[type];
  };

  const selectContentType = (type: 'paragraph' | 'image' | 'video') => {
    const newBlock = createContentBlock(type);
    onUpdate('content', newBlock);
    setActiveTab('content');
  };

  const changeColumnCount = (count: number) => {
    if (count >= MIN_COLUMNS && count <= MAX_COLUMNS && onColumnCountChange) {
      onColumnCountChange(count);
    }
  };

  const renderLayoutControls = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-600 mb-3">
          <GridIcon className="w-4 h-4 inline mr-2" />
          Column Count
        </label>
        <div className="flex items-center gap-2">
          <button
            onClick={() => changeColumnCount(currentColumnCount - 1)}
            disabled={currentColumnCount <= MIN_COLUMNS}
            className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
          >
            <CloseIcon className="w-4 h-4" />
          </button>
          
          <div className="flex gap-1">
            {Array.from({ length: MAX_COLUMNS }, (_, i) => i + 1).map(count => (
              <button
                key={count}
                onClick={() => changeColumnCount(count)}
                className={`w-10 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                  currentColumnCount === count
                    ? 'bg-blue-100 text-blue-700 border border-blue-300'
                    : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100'
                }`}
              >
                {count}
              </button>
            ))}
          </div>
          
          <button
            onClick={() => changeColumnCount(currentColumnCount + 1)}
            disabled={currentColumnCount >= MAX_COLUMNS}
            className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
          >
            <PlusIcon className="w-4 h-4" />
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Current: {currentColumnCount} column{currentColumnCount !== 1 ? 's' : ''} (Max: {MAX_COLUMNS})
        </p>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-600 mb-2">Gap Between Columns</label>
        <div className="flex items-center gap-2">
          <input
            type="range"
            min="0"
            max="48"
            step="4"
            value={(columnData.content as any)?.gap || 24}
            onChange={(e) => onUpdate('gap', parseInt(e.target.value))}
            className="flex-1"
          />
          <span className="text-sm text-gray-600 min-w-[40px]">
            {(columnData.content as any)?.gap || 24}px
          </span>
        </div>
      </div>
    </div>
  );

  if (!contentBlock || typeof contentBlock !== 'object' || !('type' in contentBlock)) {
    return (
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl p-6 w-96 shadow-xl border border-gray-200 z-[100] max-w-[90vw]">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">
            Column {columnIndex + 1} Settings
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="text-center">
          <p className="text-gray-600 mb-4">Choose content type for this column:</p>
          <div className="grid grid-cols-1 gap-3">
            {CONTENT_TYPES.map(({ type, label, icon: Icon }) => (
              <button
                key={type}
                onClick={() => selectContentType(type)}
                className="flex items-center justify-center gap-3 p-4 bg-gray-50 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors"
              >
                <Icon className="w-5 h-5 text-gray-600" />
                <span className="text-gray-700 font-medium">{label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const updateContentField = (field: string, value: any) => {
    const updatedContent = {
      ...contentBlock,
      content: { ...contentBlock.content, [field]: value }
    };
    onUpdate('content', updatedContent);
  };

  const updateContentStyle = (field: string, value: any) => {
    const updatedContent = {
      ...contentBlock,
      styles: { ...contentBlock.styles, [field]: value }
    };
    onUpdate('content', updatedContent);
  };

  const renderContentSettings = () => {
    switch (contentBlock.type) {
      case 'image':
        return (
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">Image Settings</h4>
              <ImageUrlInput
                imageUrl={contentBlock.content?.url || ''}
                altText={contentBlock.content?.alt || ''}
                onImageUrlChange={(value: string) => updateContentField('url', value)}
                onAltTextChange={(value: string) => updateContentField('alt', value)}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Width</label>
                <div className="flex">
                  <input
                    type="number"
                    value={contentBlock.styles?.width || 100}
                    onChange={(e) => updateContentStyle('width', parseInt(e.target.value) || 100)}
                    className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-l-lg text-gray-800 focus:border-purple-400 focus:outline-none text-sm"
                    min="1"
                    max="1000"
                  />
                  <select
                    value={contentBlock.styles?.widthUnit || '%'}
                    onChange={(e) => updateContentStyle('widthUnit', e.target.value)}
                    className="px-3 py-2 bg-gray-50 border-l-0 border border-gray-200 rounded-r-lg text-gray-800 focus:border-purple-400 focus:outline-none text-sm"
                  >
                    <option value="%">%</option>
                    <option value="px">px</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Height</label>
                <div className="flex">
                  <input
                    type="number"
                    value={contentBlock.styles?.height || 200}
                    onChange={(e) => updateContentStyle('height', parseInt(e.target.value) || 200)}
                    className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-l-lg text-gray-800 focus:border-purple-400 focus:outline-none text-sm"
                    min="1"
                    max="1000"
                  />
                  <select
                    value={contentBlock.styles?.heightUnit || 'px'}
                    onChange={(e) => updateContentStyle('heightUnit', e.target.value)}
                    className="px-3 py-2 bg-gray-50 border-l-0 border border-gray-200 rounded-r-lg text-gray-800 focus:border-purple-400 focus:outline-none text-sm"
                  >
                    <option value="px">px</option>
                    <option value="%">%</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        );

      case 'video':
        return (
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">Video Settings</h4>
              <VideoUrlInput
                videoUrl={contentBlock.content?.url || ''}
                title={contentBlock.content?.title || ''}
                autoplay={contentBlock.content?.autoplay || false}
                controls={contentBlock.content?.controls || true}
                muted={contentBlock.content?.muted || false}
                videoWidth={contentBlock.styles?.width || 100}
                videoHeight={contentBlock.styles?.height || 200}
                widthUnit={contentBlock.styles?.widthUnit || '%'}
                heightUnit={contentBlock.styles?.heightUnit || 'px'}
                videoAlign={(contentBlock.styles?.textAlign === 'justify' ? 'left' : contentBlock.styles?.textAlign) as 'left' | 'center' | 'right' || 'left'}
                onVideoUrlChange={(value: string) => updateContentField('url', value)}
                onTitleChange={(value: string) => updateContentField('title', value)}
                onAutoplayChange={(value: boolean) => updateContentField('autoplay', value)}
                onControlsChange={(value: boolean) => updateContentField('controls', value)}
                onMutedChange={(value: boolean) => updateContentField('muted', value)}
                onWidthChange={(value: number) => updateContentStyle('width', value)}
                onHeightChange={(value: number) => updateContentStyle('height', value)}
                onWidthUnitChange={(value: 'px' | '%') => updateContentStyle('widthUnit', value)}
                onHeightUnitChange={(value: 'px' | '%') => updateContentStyle('heightUnit', value)}
                onVideoAlignChange={(value: 'left' | 'center' | 'right') => updateContentStyle('textAlign', value)}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Width</label>
                <div className="flex">
                  <input
                    type="number"
                    value={contentBlock.styles?.width || 100}
                    onChange={(e) => updateContentStyle('width', parseInt(e.target.value) || 100)}
                    className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-l-lg text-gray-800 focus:border-purple-400 focus:outline-none text-sm"
                    min="1"
                    max="1000"
                  />
                  <select
                    value={contentBlock.styles?.widthUnit || '%'}
                    onChange={(e) => updateContentStyle('widthUnit', e.target.value)}
                    className="px-3 py-2 bg-gray-50 border-l-0 border border-gray-200 rounded-r-lg text-gray-800 focus:border-purple-400 focus:outline-none text-sm"
                  >
                    <option value="%">%</option>
                    <option value="px">px</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Height</label>
                <div className="flex">
                  <input
                    type="number"
                    value={contentBlock.styles?.height || 200}
                    onChange={(e) => updateContentStyle('height', parseInt(e.target.value) || 200)}
                    className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-l-lg text-gray-800 focus:border-purple-400 focus:outline-none text-sm"
                    min="1"
                    max="1000"
                  />
                  <select
                    value={contentBlock.styles?.heightUnit || 'px'}
                    onChange={(e) => updateContentStyle('heightUnit', e.target.value)}
                    className="px-3 py-2 bg-gray-50 border-l-0 border border-gray-200 rounded-r-lg text-gray-800 focus:border-purple-400 focus:outline-none text-sm"
                  >
                    <option value="px">px</option>
                    <option value="%">%</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        );

      case 'paragraph':
        return (
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">Text Settings</h4>
              <textarea
                value={contentBlock.content?.text || ''}
                onChange={(e) => updateContentField('text', e.target.value)}
                placeholder="Enter your text..."
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 focus:border-purple-400 focus:outline-none text-sm resize-vertical"
                rows={4}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Font Size</label>
                <input
                  type="text"
                  value={contentBlock.styles?.fontSize || '1rem'}
                  onChange={(e) => updateContentStyle('fontSize', e.target.value)}
                  placeholder="1rem"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 focus:border-purple-400 focus:outline-none text-sm"
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Font Weight</label>
                <select
                  value={contentBlock.styles?.fontWeight || 'normal'}
                  onChange={(e) => updateContentStyle('fontWeight', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 focus:border-purple-400 focus:outline-none text-sm"
                >
                  <option value="normal">Normal</option>
                  <option value="bold">Bold</option>
                  <option value="lighter">Light</option>
                  <option value="600">Semi Bold</option>
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Text Color</label>
                <input
                  type="color"
                  value={contentBlock.styles?.textColor || '#000000'}
                  onChange={(e) => updateContentStyle('textColor', e.target.value)}
                  className="w-full h-10 border border-gray-200 rounded-lg cursor-pointer"
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Text Align</label>
                <select
                  value={contentBlock.styles?.textAlign || 'left'}
                  onChange={(e) => updateContentStyle('textAlign', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 focus:border-purple-400 focus:outline-none text-sm"
                >
                  <option value="left">Left</option>
                  <option value="center">Center</option>
                  <option value="right">Right</option>
                  <option value="justify">Justify</option>
                </select>
              </div>
            </div>
          </div>
        );

      default:
        return <div className="text-gray-500">Unknown content type</div>;
    }
  };

  return (
    <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl p-6 w-96 shadow-xl border border-gray-200 z-[100] max-w-[90vw] max-h-[90vh] overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          Column {columnIndex + 1} Settings
        </h3>
        <button
          onClick={onClose}
          className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-all"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Content Type Selector */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-600 mb-2">Content Type</label>
        <div className="flex gap-2">
          {CONTENT_TYPES.map(({ type, label, icon: Icon }) => (
            <button
              key={type}
              onClick={() => selectContentType(type)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                contentBlock.type === type
                  ? 'bg-blue-100 text-blue-700 border border-blue-300'
                  : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200 mb-4">
        <button
          onClick={() => setActiveTab('layout')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'layout'
              ? 'border-purple-500 text-purple-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Layout
        </button>
        <button
          onClick={() => setActiveTab('content')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'content'
              ? 'border-purple-500 text-purple-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Content
        </button>
        <button
          onClick={() => setActiveTab('style')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'style'
              ? 'border-purple-500 text-purple-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Style
        </button>
      </div>

      {/* Tab Content */}
      <div className="space-y-4">
        {activeTab === 'layout' && renderLayoutControls()}
        {activeTab === 'content' && renderContentSettings()}
        {activeTab === 'style' && (
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-700">Layout & Spacing</h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Padding</label>
                <input
                  type="text"
                  value={typeof columnData.styles?.padding === 'string' ? columnData.styles.padding : '0'}
                  onChange={(e) => onStyleUpdate('padding', e.target.value)}
                  placeholder="0px"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 focus:border-purple-400 focus:outline-none text-sm"
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Margin</label>
                <input
                  type="text"
                  value={typeof columnData.styles?.margin === 'string' ? columnData.styles.margin : '0'}
                  onChange={(e) => onStyleUpdate('margin', e.target.value)}
                  placeholder="0px"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 focus:border-purple-400 focus:outline-none text-sm"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ColumnSettingsPanel;
