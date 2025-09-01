import React, { useEffect, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Link from '@tiptap/extension-link';
import Color from '@tiptap/extension-color';
import TextStyle from '@tiptap/extension-text-style';

interface SimpleEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  className?: string;
  style?: React.CSSProperties;
}

const SimpleEditor: React.FC<SimpleEditorProps> = ({
  content,
  onChange,
  placeholder = "Start writing your content here...",
  className = "",
  style
}) => {
  const [, forceUpdate] = useState({});

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: {
          keepMarks: true,
          keepAttributes: false,
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: false,
        },
      }),
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 underline hover:text-blue-800',
        },
      }),
      TextStyle,
      Color.configure({ types: [TextStyle.name] }),
    ],
    content: content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
      setTimeout(() => forceUpdate({}), 10);
    },
    onSelectionUpdate: ({ editor }) => {
      setTimeout(() => forceUpdate({}), 10);
    },
    onTransaction: ({ editor }) => {
      setTimeout(() => forceUpdate({}), 10);
    },
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: `prose prose-lg max-w-none focus:outline-none ${className}`,
        style: style ? Object.entries(style).map(([key, value]) => `${key}: ${value}`).join('; ') : '',
        'data-placeholder': placeholder,
        spellcheck: 'true',
      },
    },
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content, false);
    }
  }, [content, editor]);

  if (!editor) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500">Loading editor...</div>
      </div>
    );
  }

  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL', previousUrl);

    if (url === null) {
      return;
    }

    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  const ToolbarButton = ({ 
    onClick, 
    isActive, 
    disabled = false, 
    children, 
    title 
  }: {
    onClick: () => void;
    isActive: () => boolean;
    disabled?: boolean;
    children: React.ReactNode;
    title: string;
  }) => {
    const active = isActive();
    return (
      <button
        onMouseDown={(e) => e.preventDefault()} // Prevent losing focus
        onClick={(e) => {
          e.preventDefault();
          onClick();
        }}
        disabled={disabled}
        title={title}
        className={`px-3 py-2 rounded-md transition-all duration-150 text-sm font-medium min-w-[36px] flex items-center justify-center ${
          active 
            ? 'bg-blue-100 text-blue-600 shadow-sm' 
            : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50 hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed'
        }`}
      >
        {children}
      </button>
    );
  };

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-4 border-b border-gray-200 bg-white sticky top-0 z-10">
        {/* Text Formatting */}
        <div className="flex items-center gap-1 mr-4">
          <ToolbarButton
            onClick={() => {
              editor.chain().focus().toggleBold().run();
              setTimeout(() => forceUpdate({}), 10);
            }}
            isActive={() => editor?.isActive('bold') || false}
            title="Bold (Ctrl+B)"
          >
            <strong>B</strong>
          </ToolbarButton>
          <ToolbarButton
            onClick={() => {
              editor.chain().focus().toggleItalic().run();
              setTimeout(() => forceUpdate({}), 10);
            }}
            isActive={() => editor?.isActive('italic') || false}
            title="Italic (Ctrl+I)"
          >
            <em>I</em>
          </ToolbarButton>
          <ToolbarButton
            onClick={() => {
              editor.chain().focus().toggleUnderline().run();
              setTimeout(() => forceUpdate({}), 10);
            }}
            isActive={() => editor?.isActive('underline') || false}
            title="Underline (Ctrl+U)"
          >
            <u>U</u>
          </ToolbarButton>
          <ToolbarButton
            onClick={() => {
              editor.chain().focus().toggleStrike().run();
              setTimeout(() => forceUpdate({}), 10);
            }}
            isActive={() => editor?.isActive('strike') || false}
            title="Strikethrough"
          >
            <s>S</s>
          </ToolbarButton>
        </div>

        {/* Headings */}
        <div className="flex items-center gap-1 mr-4">
          <ToolbarButton
            onClick={() => editor.chain().focus().setParagraph().run()}
            isActive={() => editor?.isActive('paragraph') || false}
            title="Paragraph"
          >
            P
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            isActive={() => editor?.isActive('heading', { level: 1 }) || false}
            title="Heading 1"
          >
            H1
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            isActive={() => editor?.isActive('heading', { level: 2 }) || false}
            title="Heading 2"
          >
            H2
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            isActive={() => editor?.isActive('heading', { level: 3 }) || false}
            title="Heading 3"
          >
            H3
          </ToolbarButton>
        </div>

        {/* Lists */}
        <div className="flex items-center gap-1 mr-4">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            isActive={() => editor?.isActive('bulletList') || false}
            title="Bullet List"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
            </svg>
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            isActive={() => editor?.isActive('orderedList') || false}
            title="Numbered List"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
            </svg>
          </ToolbarButton>
        </div>

        {/* Text Alignment */}
        <div className="flex items-center gap-1 mr-4">
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            isActive={() => editor?.isActive({ textAlign: 'left' }) || !editor?.getAttributes('textAlign')?.textAlign || false}
            title="Align Left"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6h18M3 12h12M3 18h9" />
            </svg>
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            isActive={() => editor?.isActive({ textAlign: 'center' }) || false}
            title="Align Center"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6h18M6 12h12M9 18h6" />
            </svg>
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            isActive={() => editor?.isActive({ textAlign: 'right' }) || false}
            title="Align Right"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6h18M9 12h12M12 18h9" />
            </svg>
          </ToolbarButton>
        </div>

        {/* Link */}
        <div className="flex items-center gap-1 mr-4">
          <ToolbarButton
            onClick={setLink}
            isActive={() => editor?.isActive('link') || false}
            title="Add Link"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().unsetLink().run()}
            isActive={() => false}
            disabled={!editor?.isActive('link')}
            title="Remove Link"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
            </svg>
          </ToolbarButton>
        </div>

        {/* Text Color */}
        <div className="flex items-center gap-1 mr-4">
          <div className="relative">
            <input
              type="color"
              onInput={(e) => editor.chain().focus().setColor((e.target as HTMLInputElement).value).run()}
              value={editor.getAttributes('textStyle').color || '#000000'}
              className="w-8 h-8 rounded border border-gray-200 cursor-pointer bg-transparent"
              title="Text Color"
            />
          </div>
        </div>

        {/* Clear Formatting */}
        <div className="flex items-center gap-1">
          <ToolbarButton
            onClick={() => editor.chain().focus().unsetAllMarks().run()}
            isActive={() => false}
            title="Clear Formatting"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </ToolbarButton>
        </div>
      </div>

      {/* Editor Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <EditorContent 
          editor={editor} 
          className="h-full"
          style={{
            minHeight: 'calc(100vh - 200px)',
            ...style
          }}
        />
      </div>

      <style jsx global>{`
        .ProseMirror {
          outline: none !important;
          min-height: calc(100vh - 200px);
          padding: 1rem;
        }
        
        .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: #9ca3af;
          pointer-events: none;
          height: 0;
          font-size: 1.125rem;
          line-height: 1.75;
        }

        .ProseMirror h1 {
          font-size: 2rem;
          font-weight: bold;
          margin-bottom: 1rem;
        }

        .ProseMirror h2 {
          font-size: 1.5rem;
          font-weight: bold;
          margin-bottom: 0.75rem;
        }

        .ProseMirror h3 {
          font-size: 1.25rem;
          font-weight: bold;
          margin-bottom: 0.5rem;
        }

        .ProseMirror ul {
          list-style-type: disc;
          margin-left: 1.5rem;
          margin-bottom: 1rem;
        }

        .ProseMirror ol {
          list-style-type: decimal;
          margin-left: 1.5rem;
          margin-bottom: 1rem;
        }

        .ProseMirror li {
          margin-bottom: 0.25rem;
        }

        .ProseMirror a {
          color: #3b82f6;
          text-decoration: underline;
        }

        .ProseMirror a:hover {
          color: #1d4ed8;
        }
      `}</style>
    </div>
  );
};

export default SimpleEditor;
