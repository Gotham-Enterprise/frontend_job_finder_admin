"use client";

import React, { useState, useEffect, useRef } from "react";
import { useEditor, EditorContent, Editor, NodeViewWrapper, ReactNodeViewRenderer } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import InputModal from "@/components/ui/InputModal";
import ImageUploadWithResize from "@/components/ui/ImageUploadWithResize";
import { ProcessedImage } from "@/services/utils/imageResizer";
import { blogApi } from "@/services/api/blog";

// Custom Image Component that renders an Image WITH a Trash/Delete button overlay
const CustomImageComponent = (props: any) => {
  return (
    <NodeViewWrapper as="div" className="relative group inline-block max-w-full my-4">
      <img
        src={props.node.attrs.src}
        alt={props.node.attrs.alt || "Uploaded Medical Diagram"}
        className="max-w-full h-auto rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
      />
      <button
        onClick={() => props.deleteNode()}
        contentEditable={false}
        className="absolute top-2 right-2 p-1.5 bg-red-600/90 text-white rounded-lg shadow opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700 focus:outline-none"
        title="Remove Image"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
          />
        </svg>
      </button>
    </NodeViewWrapper>
  );
};

const CustomImageExtension = Image.extend({
  addNodeView() {
    return ReactNodeViewRenderer(CustomImageComponent);
  },
});

interface HtmlEditorPreviewProps {
  initialHtml: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

const MenuBar = ({
  editor,
  props,
}: {
  editor: Editor | null;
  props: { onLinkClick: () => void; onImageClick: () => void };
}) => {
  if (!editor) {
    return null;
  }

  const toolbarBtnClass = (isActive: boolean) =>
    `p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${
      isActive ? "bg-gray-200 dark:bg-gray-700 text-blue-600 dark:text-blue-400" : "text-gray-700 dark:text-gray-300"
    }`;

  return (
    <div className="flex flex-wrap items-center gap-1 p-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={toolbarBtnClass(editor.isActive("bold"))}
        title="Bold"
      >
        <strong className="font-bold">B</strong>
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={toolbarBtnClass(editor.isActive("italic"))}
        title="Italic"
      >
        <em className="font-serif italic">I</em>
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        className={toolbarBtnClass(editor.isActive("underline"))}
        title="Underline"
      >
        <span className="underline">U</span>
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleStrike().run()}
        className={toolbarBtnClass(editor.isActive("strike"))}
        title="Strikethrough"
      >
        <span className="line-through">S</span>
      </button>

      <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

      <button
        type="button"
        onClick={props.onLinkClick}
        className={toolbarBtnClass(editor.isActive("link"))}
        title="Add Link"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
          />
        </svg>
      </button>

      <button
        type="button"
        onClick={props.onImageClick}
        className={toolbarBtnClass(editor.isActive("image"))}
        title="Add Image"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      </button>

      <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={toolbarBtnClass(editor.isActive("heading", { level: 1 }))}
        title="Heading 1"
      >
        H1
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={toolbarBtnClass(editor.isActive("heading", { level: 2 }))}
        title="Heading 2"
      >
        H2
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={toolbarBtnClass(editor.isActive("heading", { level: 3 }))}
        title="Heading 3"
      >
        H3
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}
        className={toolbarBtnClass(editor.isActive("heading", { level: 4 }))}
        title="Heading 4"
      >
        H4
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 5 }).run()}
        className={toolbarBtnClass(editor.isActive("heading", { level: 5 }))}
        title="Heading 5"
      >
        H5
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 6 }).run()}
        className={toolbarBtnClass(editor.isActive("heading", { level: 6 }))}
        title="Heading 6"
      >
        H6
      </button>

      <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={toolbarBtnClass(editor.isActive("bulletList"))}
        title="Bullet List"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={toolbarBtnClass(editor.isActive("orderedList"))}
        title="Numbered List"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h14M7 16h14M3 8h.01M3 16h.01" />
        </svg>
      </button>

      <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

      <button
        type="button"
        onClick={() => editor.chain().focus().setTextAlign("left").run()}
        className={toolbarBtnClass(editor.isActive({ textAlign: "left" }))}
        title="Align Left"
      >
        L
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().setTextAlign("center").run()}
        className={toolbarBtnClass(editor.isActive({ textAlign: "center" }))}
        title="Align Center"
      >
        C
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().setTextAlign("right").run()}
        className={toolbarBtnClass(editor.isActive({ textAlign: "right" }))}
        title="Align Right"
      >
        R
      </button>
    </div>
  );
};

const HtmlEditorPreview: React.FC<HtmlEditorPreviewProps> = ({
  initialHtml,
  onChange,
  placeholder = "Write content here...",
}) => {
  const [internalHtml, setInternalHtml] = useState(initialHtml);
  const [activeTab, setActiveTab] = useState<"visual" | "html" | "preview">("visual");
  const activeTabRef = useRef(activeTab);

  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  useEffect(() => {
    activeTabRef.current = activeTab;
  }, [activeTab]);

  const editor = useEditor({
    extensions: [
      StarterKit,
      CustomImageExtension.configure({
        inline: true,
      }),
      Underline,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Link.configure({
        openOnClick: false,
      }),
    ],
    content: initialHtml,
    onUpdate: ({ editor }) => {
      if (activeTabRef.current === "visual") {
        const newHtml = editor.getHTML();
        setInternalHtml(newHtml);
        onChange(newHtml);
      }
    },
    editorProps: {
      attributes: {
        class: "prose prose-sm dark:prose-invert focus:outline-none max-w-none min-h-[300px]",
      },
    },
  });

  useEffect(() => {
    if (editor && initialHtml !== internalHtml && initialHtml !== editor.getHTML()) {
      editor.commands.setContent(initialHtml, false);
      setInternalHtml(initialHtml);
    }
  }, [initialHtml, editor, internalHtml]);

  const handleHtmlChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setInternalHtml(value);
    onChange(value);
  };

  const handleImageUpload = async (processedImage: ProcessedImage) => {
    setIsUploadingImage(true);
    try {
      if (processedImage.file) {
        const response = await blogApi.uploadMedia({ mediaUpload: processedImage.file, type: "IMAGE" });
        if (response.success && response.data.url) {
          editor?.chain().focus().setImage({ src: response.data.url }).run();
        } else {
          alert("Failed to upload image. Unexpected server response.");
        }
      } else if (processedImage.dataUrl) {
        editor?.chain().focus().setImage({ src: processedImage.dataUrl }).run();
      }
    } catch (error) {
      console.error("Image Upload Error:", error);
      alert("An error occurred while uploading. Fallbacking to standard size.");
      if (processedImage.dataUrl) {
        editor?.chain().focus().setImage({ src: processedImage.dataUrl }).run();
      }
    } finally {
      setIsUploadingImage(false);
      setIsImageModalOpen(false);
    }
  };

  const TabButton = ({ tab, label }: { tab: "visual" | "html" | "preview"; label: string }) => (
    <button
      type="button"
      onClick={() => {
        if (tab === "visual" && activeTab !== "visual" && editor) {
          editor.commands.setContent(internalHtml, false);
        }
        setActiveTab(tab);
      }}
      className={`px-4 py-2 text-sm font-medium transition-colors ${
        activeTab === tab
          ? "bg-white dark:bg-gray-900 border-t-2 border-t-transparent text-blue-600 border-b-2 border-blue-600"
          : "text-gray-600 dark:text-gray-400 border-t-2 border-t-transparent hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden flex flex-col w-full relative">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <div className="flex items-center">
          <TabButton tab="visual" label="Visual Editor" />
          <TabButton tab="html" label="Edit HTML" />
          <TabButton tab="preview" label="Preview View" />
        </div>
      </div>

      <div className="flex-1 bg-white dark:bg-gray-900 min-h-[300px] relative flex flex-col">
        {activeTab === "visual" && (
          <div className="flex flex-col h-full flex-1">
            <MenuBar
              editor={editor}
              props={{
                onLinkClick: () => {
                  if (editor && editor.state.selection.empty) {
                    alert("Please select some text first to apply a link.");
                    return;
                  }
                  setIsLinkModalOpen(true);
                },
                onImageClick: () => setIsImageModalOpen(true),
              }}
            />
            {isUploadingImage && (
              <div className="absolute inset-0 bg-white/50 dark:bg-gray-900/50 flex items-center justify-center z-10">
                <div className="flex flex-col flex-center items-center gap-2">
                  <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">Uploading Media...</span>
                </div>
              </div>
            )}
            <div className="p-4 overflow-y-auto cursor-text" onClick={() => editor?.commands.focus()}>
              <EditorContent editor={editor} />
            </div>
          </div>
        )}

        {activeTab === "html" && (
          <div className="flex flex-col h-full flex-1">
            <div className="p-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  try {
                    // Try to unescape common JSON string escapes
                    const unescaped = internalHtml
                      .replace(/\\n/g, "\n")
                      .replace(/\\r/g, "\r")
                      .replace(/\\t/g, "\t")
                      .replace(/\\"/g, '"')
                      .replace(/\\'/g, "'");

                    setInternalHtml(unescaped);
                    onChange(unescaped);
                  } catch (e) {
                    console.error("Format error", e);
                  }
                }}
                className="text-xs px-3 py-1.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 transition-colors"
                title="Cleans raw JSON escaped characters from pasted code"
              >
                Clean Escaped JSON
              </button>
            </div>
            <textarea
              value={internalHtml}
              onChange={handleHtmlChange}
              placeholder={placeholder}
              className="w-full flex-1 min-h-[300px] p-4 font-mono text-sm resize-y focus:outline-none bg-transparent text-gray-900 dark:text-white"
            />
          </div>
        )}

        {activeTab === "preview" && (
          <div className="w-full h-full min-h-[300px] p-5 overflow-y-auto">
            {internalHtml.trim() ? (
              <div
                className="prose prose-sm dark:prose-invert max-w-full break-words"
                dangerouslySetInnerHTML={{ __html: internalHtml }}
              />
            ) : (
              <p className="text-gray-400 dark:text-gray-500 italic">No content to preview.</p>
            )}
          </div>
        )}
      </div>

      <InputModal
        isOpen={isLinkModalOpen}
        onClose={() => setIsLinkModalOpen(false)}
        title="Insert Link"
        message="Enter the URL for the selected text"
        placeholder="https://example.com"
        inputType="text"
        confirmText="Add Link"
        onConfirm={(value) => {
          if (editor) {
            editor.chain().focus().extendMarkRange("link").setLink({ href: value }).run();
          }
          setIsLinkModalOpen(false);
        }}
        onCancel={() => setIsLinkModalOpen(false)}
      />

      {isImageModalOpen && (
        <ImageUploadWithResize
          isOpen={isImageModalOpen}
          onClose={() => setIsImageModalOpen(false)}
          title="Upload Medical Diagram or Image"
          onImageSelect={handleImageUpload}
        />
      )}
    </div>
  );
};

export default HtmlEditorPreview;
