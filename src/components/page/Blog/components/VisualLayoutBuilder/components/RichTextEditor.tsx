import React, { useState, useRef, useEffect, useCallback } from 'react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  onCancel?: () => void;
  placeholder?: string;
  style?: React.CSSProperties;
  className?: string;
  isMultiline?: boolean;
}

interface FormatButtonProps {
  command: string;
  icon: React.ReactNode;
  title: string;
  isActive: boolean;
  onClick: () => void;
}

const FormatButton: React.FC<FormatButtonProps> = ({ command, icon, title, isActive, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`px-3 py-2 rounded-md transition-all duration-150 text-sm font-medium min-w-[36px] flex items-center justify-center ${
      isActive 
        ? 'bg-blue-100 text-blue-600 shadow-sm transform scale-95' 
        : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50 hover:shadow-sm'
    }`}
    style={{
      boxShadow: isActive 
        ? 'inset 0 2px 4px rgba(59, 130, 246, 0.2)' 
        : 'none'
    }}
    title={title}
    onMouseDown={(e) => e.preventDefault()} 
  >
    {icon}
  </button>
);

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  onBlur,
  onCancel,
  placeholder = "Enter text...",
  style,
  className = "",
  isMultiline = true
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isToolbarVisible, setIsToolbarVisible] = useState(false);
  const [toolbarPosition, setToolbarPosition] = useState({ top: 0, left: 0, isBelow: false });
  const [activeFormats, setActiveFormats] = useState({
    bold: false,
    italic: false,
    underline: false
  });

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  const checkActiveFormats = useCallback(() => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    setActiveFormats({
      bold: document.queryCommandState('bold'),
      italic: document.queryCommandState('italic'),
      underline: document.queryCommandState('underline')
    });
  }, []);

  const handleSelection = useCallback(() => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed || !editorRef.current) {
      setIsToolbarVisible(false);
      return;
    }

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    const editorRect = editorRef.current.getBoundingClientRect();

    if (rect.width > 0 && rect.height > 0) {
      const toolbarWidth = 180;
      const toolbarHeight = 50;
      
 
      let top = rect.top - editorRect.top - toolbarHeight - 10;
      let left = rect.left - editorRect.left + (rect.width / 2) - (toolbarWidth / 2);
      let isBelow = false;
      
    
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      

      if (rect.left + editorRect.left - (toolbarWidth / 2) < 10) {
        left = 10 - editorRect.left;
      }
      
      if (rect.left + editorRect.left + (toolbarWidth / 2) > viewportWidth - 10) {
        left = viewportWidth - toolbarWidth - 10 - editorRect.left;
      }
      
      if (rect.top - toolbarHeight - 10 < 10) {
        top = rect.bottom - editorRect.top + 10;
        isBelow = true;
      }
      
      setToolbarPosition({ top, left, isBelow });
      setIsToolbarVisible(true);
      checkActiveFormats();
    }
  }, [checkActiveFormats]);

  const executeCommand = useCallback((command: string, value?: string) => {
    document.execCommand(command, false, value);
    
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
    
    editorRef.current?.focus();
    checkActiveFormats();
  }, [onChange, checkActiveFormats]);

  const handleInput = useCallback(() => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  }, [onChange]);


  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onCancel?.();
      return;
    }

    if (e.ctrlKey || e.metaKey) {
      switch (e.key.toLowerCase()) {
        case 'b':
          e.preventDefault();
          executeCommand('bold');
          break;
        case 'i':
          e.preventDefault();
          executeCommand('italic');
          break;
        case 'u':
          e.preventDefault();
          executeCommand('underline');
          break;
      }
    }

    if (!isMultiline && e.key === 'Enter') {
      e.preventDefault();
      onBlur?.();
    }
  }, [executeCommand, onBlur, onCancel, isMultiline]);


  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
  }, []);

  // Setup event listeners
  useEffect(() => {
    const handleSelectionChange = () => {
      handleSelection();
    };

    document.addEventListener('selectionchange', handleSelectionChange);
    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
    };
  }, [handleSelection]);

  // Hide toolbar when clicking outside
  useEffect(() => {
    const detectClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      
      if (editorRef.current?.contains(target) || 
          target.closest('.rich-text-toolbar')) {
        return;
      }

      setIsToolbarVisible(false);
    };

    document.addEventListener('mousedown', detectClickOutside);
    return () => {
      document.removeEventListener('mousedown', detectClickOutside);
    };
  }, []);

  return (
    <div className="relative">
      {/* Formatting Toolbar */}
      {isToolbarVisible && (
        <div
          className="rich-text-toolbar fixed z-[9999] bg-white rounded-lg py-2 px-1 flex gap-1"
          style={{
            top: `${toolbarPosition.top + (editorRef.current?.getBoundingClientRect().top || 0)}px`,
            left: `${toolbarPosition.left + (editorRef.current?.getBoundingClientRect().left || 0)}px`,
            boxShadow: '0 20px 35px rgba(0, 0, 0, 0.2), 0 10px 15px rgba(0, 0, 0, 0.15), 0 4px 6px rgba(0, 0, 0, 0.1)',
          }}
          onMouseDown={(e) => e.preventDefault()} 
        >
         
          <div 
            className={`absolute left-1/2 transform -translate-x-1/2 w-3 h-3 bg-white rotate-45 ${
              toolbarPosition.isBelow 
                ? 'top-[-6px]' 
                : 'bottom-[-6px]'
            }`}
            style={{ 
              boxShadow: toolbarPosition.isBelow 
                ? '-2px -2px 8px rgba(0, 0, 0, 0.1)' 
                : '2px 2px 8px rgba(0, 0, 0, 0.1)',
            }}
          />
          
          <FormatButton
            command="bold"
            icon={<strong className="text-sm">B</strong>}
            title="Bold (Ctrl+B)"
            isActive={activeFormats.bold}
            onClick={() => executeCommand('bold')}
          />
          <FormatButton
            command="italic"
            icon={<em className="text-sm">I</em>}
            title="Italic (Ctrl+I)"
            isActive={activeFormats.italic}
            onClick={() => executeCommand('italic')}
          />
          <FormatButton
            command="underline"
            icon={<u className="text-sm">U</u>}
            title="Underline (Ctrl+U)"
            isActive={activeFormats.underline}
            onClick={() => executeCommand('underline')}
          />
          
        
          <div className="ml-1 pl-1 relative">
          
            <div 
              className="absolute left-0 top-1/2 transform -translate-y-1/2 w-px h-6 bg-gradient-to-b from-transparent via-gray-300 to-transparent"
              style={{
                boxShadow: '1px 0 2px rgba(0, 0, 0, 0.1)'
              }}
            />
            <FormatButton
              command="removeFormat"
              icon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              }
              title="Remove Formatting"
              isActive={false}
              onClick={() => executeCommand('removeFormat')}
            />
          </div>
        </div>
      )}

 
      <div
        ref={editorRef}
        contentEditable
        className={`w-full bg-transparent border-none outline-none resize-none ${className}`}
        style={{
          ...style,
          minHeight: isMultiline ? '80px' : 'auto',
        }}
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        onBlur={onBlur}
        onPaste={handlePaste}
        data-placeholder={placeholder}
        suppressContentEditableWarning={true}
      />

      <style dangerouslySetInnerHTML={{
        __html: `
          [contenteditable]:empty:before {
            content: attr(data-placeholder);
            color: #9ca3af;
            pointer-events: none;
          }
          [contenteditable] {
            outline: none;
          }
          [contenteditable]:focus {
            outline: none;
          }
        `
      }} />
    </div>
  );
};

export default RichTextEditor;
