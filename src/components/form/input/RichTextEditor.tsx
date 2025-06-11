"use client";
import React, { useCallback, useRef, useState, useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import TextStyle from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import Paragraph from "@tiptap/extension-paragraph";
import { useDropzone } from "react-dropzone";

const ToolbarButton: React.FC<{
  onClick: () => void;
  isActive?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  title?: string;
}> = ({ onClick, isActive, disabled, children, title }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    title={title}
    className={`p-2 rounded-md border border-gray-300 dark:border-gray-600 transition-colors
      ${isActive 
        ? "bg-brand-500 text-white border-brand-500" 
        : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
      }
      ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
    `}
  >
    {children}
  </button>
);

const ColorPicker: React.FC<{
  onColorChange: (color: string) => void;
  currentColor?: string;
}> = ({ onColorChange, currentColor }) => {
  const colors = [
    "#000000", "#FF0000", "#00FF00", "#0000FF", "#FFFF00", 
    "#FF00FF", "#00FFFF", "#FFA500", "#800080", "#008000"
  ];

  return (
    <div className="flex flex-wrap gap-1 p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800">
      {colors.map((color) => (
        <button
          key={color}
          onClick={() => onColorChange(color)}
          className={`w-6 h-6 rounded border-2 ${
            currentColor === color ? "border-gray-800 dark:border-white" : "border-gray-300"
          }`}
          style={{ backgroundColor: color }}
          title={`Set text color to ${color}`}
        />
      ))}
    </div>
  );
};

interface RichTextEditorProps {
  content?: string;
  onChange?: (content: string) => void;
  placeholder?: string;
  className?: string;
  minHeight?: number;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  content = "",
  onChange,
  placeholder = "Start writing your blog post...",
  className = "",
  minHeight = 300,
}) => {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showImageUpload, setShowImageUpload] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        paragraph: false,
      }),
      Paragraph.configure({
        HTMLAttributes: {
          class: 'mb-3', 
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: "max-w-full h-auto rounded-lg",
        },
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Underline,
      Link.configure({
        openOnClick: false,
      }),
      TextStyle,
      Color,
    ],
    content: content,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange?.(html);
    },
    editorProps: {
      attributes: {
        class: `prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none dark:prose-invert ${className}`,
        style: `min-height: ${minHeight}px;`,
      },
    },
  });

  useEffect(() => {
    if (editor && content !== undefined) {
      const currentContent = editor.getHTML();
     
      if (content !== currentContent) {
        editor.commands.setContent(content, false);
      }
    }
  }, [editor, content]);

  const imageUpload = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const url = e.target?.result as string;
      if (editor && url) {
        editor.chain().focus().setImage({ src: url }).run();
      }
    };
    reader.readAsDataURL(file);
  }, [editor]);


  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg"],
    },
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        imageUpload(acceptedFiles[0]);
        setShowImageUpload(false);
      }
    },
    noClick: true,
  });

  const fileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      imageUpload(file);
      setShowImageUpload(false);
    }
  };

  const addLink = () => {
    const url = prompt("Enter URL:");
    if (url && editor) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  if (!editor) {
    return <div>Loading editor...</div>;
  }

  return (
    <div className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden bg-white dark:bg-gray-800">
      <div className="border-b border-gray-300 dark:border-gray-600 p-3 bg-gray-50 dark:bg-gray-700">
        <div className="flex flex-wrap gap-2 items-center">
 
          <div className="flex gap-1">
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBold().run()}
              isActive={editor.isActive("bold")}
              title="Bold"
            >
              <strong>B</strong>
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleItalic().run()}
              isActive={editor.isActive("italic")}
              title="Italic"
            >
              <em>I</em>
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              isActive={editor.isActive("underline")}
              title="Underline"
            >
              <u>U</u>
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleStrike().run()}
              isActive={editor.isActive("strike")}
              title="Strike"
            >
              <s>S</s>
            </ToolbarButton>
          </div>

          <div className="flex gap-1">
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
              isActive={editor.isActive("heading", { level: 1 })}
              title="Heading 1"
            >
              H1
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              isActive={editor.isActive("heading", { level: 2 })}
              title="Heading 2"
            >
              H2
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
              isActive={editor.isActive("heading", { level: 3 })}
              title="Heading 3"
            >
              H3
            </ToolbarButton>
          </div>


          <div className="flex gap-1">
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              isActive={editor.isActive("bulletList")}
              title="Bullet List"
            >
              •
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              isActive={editor.isActive("orderedList")}
              title="Numbered List"
            >
              1.
            </ToolbarButton>
          </div>

          <div className="flex gap-1">
            <ToolbarButton
              onClick={() => editor.chain().focus().setTextAlign("left").run()}
              isActive={editor.isActive({ textAlign: "left" })}
              title="Align Left"
            >
              ⬅
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().setTextAlign("center").run()}
              isActive={editor.isActive({ textAlign: "center" })}
              title="Align Center"
            >
              ⬄
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().setTextAlign("right").run()}
              isActive={editor.isActive({ textAlign: "right" })}
              title="Align Right"
            >
              ➡
            </ToolbarButton>
          </div>

          <div className="flex gap-1">
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              isActive={editor.isActive("blockquote")}
              title="Quote"
            >
              &quot;
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleCodeBlock().run()}
              isActive={editor.isActive("codeBlock")}
              title="Code Block"
            >
              &lt;/&gt;
            </ToolbarButton>
          </div>

          <div className="flex gap-1">
            <ToolbarButton
              onClick={addLink}
              title="Add Link"
            >
              🔗
            </ToolbarButton>
            <ToolbarButton
              onClick={() => setShowImageUpload(!showImageUpload)}
              title="Add Image"
            >
              🖼️
            </ToolbarButton>
          </div>

          <div className="relative">
            <ToolbarButton
              onClick={() => setShowColorPicker(!showColorPicker)}
              title="Text Color"
            >
              🎨
            </ToolbarButton>
            {showColorPicker && (
              <div className="absolute top-full left-0 mt-1 z-10">
                <ColorPicker
                  onColorChange={(color) => {
                    editor.chain().focus().setColor(color).run();
                    setShowColorPicker(false);
                  }}
                  currentColor={editor.getAttributes("textStyle").color}
                />
              </div>
            )}
          </div>

          {/* Undo/Redo */}
          <div className="flex gap-1 ml-auto">
            <ToolbarButton
              onClick={() => editor.chain().focus().undo().run()}
              disabled={!editor.can().undo()}
              title="Undo"
            >
              ↶
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().redo().run()}
              disabled={!editor.can().redo()}
              title="Redo"
            >
              ↷
            </ToolbarButton>
          </div>
        </div>

        {/* Image Upload Section */}
        {showImageUpload && (
          <div className="mt-3 p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800">
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors
                ${isDragActive 
                  ? "border-brand-500 bg-brand-50 dark:bg-brand-900/20" 
                  : "border-gray-300 dark:border-gray-600 hover:border-brand-400"
                }
              `}
            >
              <input {...getInputProps()} />
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={fileInputChange}
                className="hidden"
              />
              <div className="space-y-2">
                <div className="text-2xl">📷</div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {isDragActive 
                    ? "Drop the image here" 
                    : "Drag and drop an image, or click to select"
                  }
                </p>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  className="px-4 py-2 bg-brand-500 text-white rounded-md hover:bg-brand-600 transition-colors"
                >
                  Choose File
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div 
        {...getRootProps()}
        className={`relative ${isDragActive ? "bg-brand-50 dark:bg-brand-900/20" : ""}`}
      >
        <input {...getInputProps()} />
        <EditorContent 
          editor={editor} 
          className="p-4"
          style={{ minHeight: `${minHeight}px` }}
        />
        {isDragActive && (
          <div className="absolute inset-0 flex items-center justify-center bg-brand-500/10 border-2 border-dashed border-brand-500 rounded-lg">
            <div className="text-center">
              <div className="text-4xl mb-2">📷</div>
              <p className="text-brand-600 dark:text-brand-400 font-medium">
                Drop your image here to add it to the content
              </p>
            </div>
          </div>
        )}
        {editor.isEmpty && (
          <div className="absolute top-4 left-4 text-gray-400 dark:text-gray-500 pointer-events-none">
            {placeholder}
          </div>
        )}
      </div>
    </div>
  );
};

export default RichTextEditor;
