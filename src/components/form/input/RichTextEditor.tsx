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
import { 
  AlignLeftIcon, 
  AlignCenterIcon, 
  AlignRightIcon, 
  QuoteIcon, 
  CodeBlockIcon, 
  LinkIcon, 
  ImageIcon,
  ChevronDownIcon 
} from "../../../icons";
import "../../../styles/editor.css";
import ImageUploadWithResize from "../../ui/ImageUploadWithResize";
import { ProcessedImage } from "../../../services/utils/imageResizer";

const ToolbarButton: React.FC<{
  onClick: () => void;
  isActive?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  title?: string;
}> = ({ onClick, isActive, disabled, children, title }) => (
  <button
    type="button"
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
          type="button"
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

const FormatDropdown: React.FC<{
  editor: any;
  currentFormat: string;
  onFormatChange: (format: string) => void;
}> = ({ editor, currentFormat, onFormatChange }) => {
  const formatOptions = [
    { label: "Paragraph", value: "paragraph" },
    { label: "Heading 1", value: "heading1" },
    { label: "Heading 2", value: "heading2" },
    { label: "Heading 3", value: "heading3" },
    { label: "Heading 4", value: "heading4" },
    { label: "Heading 5", value: "heading5" },
    { label: "Heading 6", value: "heading6" },
  ];

  const formatChange = (format: string) => {
    if (format === "paragraph") {
      editor.chain().focus().setParagraph().run();
    } else if (format.startsWith("heading")) {
      const level = parseInt(format.replace("heading", ""));
      editor.chain().focus().toggleHeading({ level }).run();
    }
    onFormatChange(format);
  };

  return (
    <div className="min-w-[120px] p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 shadow-lg">
      {formatOptions.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => formatChange(option.value)}
          className={`w-full text-left px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
            currentFormat === option.label
              ? "bg-brand-500 text-white"
              : "text-gray-700 dark:text-gray-300"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
};

const ListDropdown: React.FC<{
  editor: any;
  onListChange: (listType: string) => void;
}> = ({ editor, onListChange }) => {
  const listOptions = [
    { label: "Bullet List", value: "bulletList", icon: "•" },
    { label: "Numbered List", value: "orderedList", icon: "1." },
  ];

  const listChange = (listType: string) => {
    if (listType === "bulletList") {
      editor.chain().focus().toggleBulletList().run();
    } else if (listType === "orderedList") {
      editor.chain().focus().toggleOrderedList().run();
    }
    onListChange(listType);
  };

  return (
    <div className="min-w-[140px] p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 shadow-lg">
      {listOptions.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => listChange(option.value)}
          className={`w-full text-left px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-2 ${
            editor.isActive(option.value)
              ? "bg-brand-500 text-white"
              : "text-gray-700 dark:text-gray-300"
          }`}
        >
          <span className="font-bold">{option.icon}</span>
          {option.label}
        </button>
      ))}
    </div>
  );
};

interface MergeTagEntry {
  label: string;
  tag: string;
}

interface RichTextEditorProps {
  content?: string;
  onChange?: (content: string) => void;
  placeholder?: string;
  className?: string;
  minHeight?: number;
  hideImageButton?: boolean;
  onEditorReady?: (imageUploadFn: (file: File) => void) => void;
  mergeTags?: MergeTagEntry[];
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  content = "",
  onChange,
  placeholder = "Start writing your blog post...",
  className = "",
  minHeight = 300,
  hideImageButton = false,
  onEditorReady,
  mergeTags,
}) => {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [showImageResizeModal, setShowImageResizeModal] = useState(false);
  const [showFormatDropdown, setShowFormatDropdown] = useState(false);
  const [showListDropdown, setShowListDropdown] = useState(false);
  const [showMergeTagDropdown, setShowMergeTagDropdown] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getCurrentFormat = () => {
    if (editor?.isActive("heading", { level: 1 })) return "Heading 1";
    if (editor?.isActive("heading", { level: 2 })) return "Heading 2";
    if (editor?.isActive("heading", { level: 3 })) return "Heading 3";
    if (editor?.isActive("heading", { level: 4 })) return "Heading 4";
    if (editor?.isActive("heading", { level: 5 })) return "Heading 5";
    if (editor?.isActive("heading", { level: 6 })) return "Heading 6";
    return "Paragraph";
  };  const editor = useEditor({
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
        allowBase64: true,
        inline: false,
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 underline hover:text-blue-800 font-medium',
        },
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
        class: `prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none dark:prose-invert prose-ul:list-disc prose-ol:list-decimal prose-li:marker:text-current prose-strong:font-bold prose-em:italic prose-a:text-blue-600 prose-a:underline prose-a:font-medium ${className}`,
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

  // Handle processed image from resize modal
  const handleProcessedImageSelect = useCallback((processedImage: ProcessedImage) => {
    if (editor) {
      editor.chain().focus().setImage({ 
        src: processedImage.dataUrl,
        alt: processedImage.file.name 
      }).run();
    }
  }, [editor]);

  // Expose the imageUpload function to parent components
  useEffect(() => {
    if (editor && onEditorReady) {
      onEditorReady(imageUpload);
    }
  }, [editor, onEditorReady, imageUpload]);


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
  useEffect(() => {
    if (!editor) return;

    const imageClick = (event: Event) => {
      const target = event.target as HTMLImageElement;
      
      const templateImageAttr = target.getAttribute('data-template-image');
      const isPlaceholder = target.src?.includes('image-placeholder.jpg');
      const isTemplateImage = templateImageAttr === 'true' || templateImageAttr === 'replaced' || isPlaceholder;
      
      if (target.tagName === 'IMG' && isTemplateImage) {
        
        console.log('Template image detected, opening file picker...');
        
        event.preventDefault();
        event.stopPropagation();


        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.style.display = 'none';
        
        input.onchange = (e) => {
          const file = (e.target as HTMLInputElement).files?.[0];
          if (file) {
            console.log('File selected:', file.name);
            
            const reader = new FileReader();
            reader.onload = (loadEvent) => {
              const newSrc = loadEvent.target?.result as string;
              if (newSrc) {
                console.log('File read, updating image...');
                
                try {
                
                  const { state } = editor.view;
                  let imagePos = -1;
                  let imageNode: any = null;
                  
                  state.doc.descendants((node: any, pos: number) => {
                    if (node.type.name === 'image' && node.attrs.src === target.src) {
                      imagePos = pos;
                      imageNode = node;
                      return false;
                    }
                  });
                  
                  if (imagePos >= 0 && imageNode) {
                    console.log('Found image node at position:', imagePos);
                    
                    
                    const newAttrs = {
                      src: newSrc,
                      alt: file.name,
                      class: 'max-w-full h-auto rounded-lg'
                    };
                    
                   
                    const tr = state.tr.setNodeMarkup(imagePos, undefined, newAttrs);
                    editor.view.dispatch(tr);
                    
             
                    
                   
                    setTimeout(() => {
                      const updatedImg = editor.view.dom.querySelector(`img[src="${newSrc}"]`) as HTMLImageElement;
                      if (updatedImg) {
                        updatedImg.setAttribute('data-template-image', 'replaced');
                        console.log('Set data-template-image="replaced" on updated image');
                      }
                      editor.commands.focus();
                    }, 100);
                  } else {
                  
                    editor.chain()
                      .focus()
                      .setImage({ 
                        src: newSrc, 
                        alt: file.name
                      })
                      .run();
                      
                   
                    setTimeout(() => {
                      const newImg = editor.view.dom.querySelector(`img[src="${newSrc}"]`) as HTMLImageElement;
                      if (newImg) {
                        newImg.setAttribute('data-template-image', 'replaced');
                      }
                    }, 100);
                  }
                } catch (error) {
                 
                  editor.chain()
                    .focus()
                    .setImage({ 
                      src: newSrc, 
                      alt: file.name
                    })
                    .run();
                }
              }
            };
            reader.readAsDataURL(file);
          }
          
        
          if (document.body.contains(input)) {
            document.body.removeChild(input);
          }
        };
        
       
        document.body.appendChild(input);
        input.click();
      }
    };

    const editorElement = editor.view.dom;
    editorElement.addEventListener('click', imageClick);

    return () => {
      editorElement.removeEventListener('click', imageClick);
    };
  }, [editor]);


  useEffect(() => {
    if (!editor) return;

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as Element;
              const images = element.tagName === 'IMG' ? [element] : element.querySelectorAll('img');
              
              images.forEach((img: Element) => {
                const imgEl = img as HTMLImageElement;
                
                if (imgEl.src?.includes('image-placeholder.jpg') && !imgEl.getAttribute('data-template-image')) {
                  imgEl.setAttribute('data-template-image', 'true');
                }
               
                if (!imgEl.src?.includes('image-placeholder.jpg') && !imgEl.getAttribute('data-template-image')) {
                  
                  if (imgEl.className.includes('max-w-full')) {
                    imgEl.setAttribute('data-template-image', 'replaced');
                  }
                }
              });
            }
          });
        }
      });
    });

    const editorElement = editor.view.dom;
    observer.observe(editorElement, {
      childList: true,
      subtree: true
    });

    return () => {
      observer.disconnect();
    };
  }, [editor]);

  if (!editor) {
    return <div>Loading editor...</div>;
  }

  return (
    <div className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden bg-white dark:bg-gray-800">
      <div className="border-b border-gray-300 dark:border-gray-600 p-3 bg-gray-50 dark:bg-gray-700">       
         <div className="flex flex-wrap gap-2 items-center">
           
          <div className="relative">
            <ToolbarButton
              onClick={() => setShowFormatDropdown(!showFormatDropdown)}
              title="Text Format"
            >
              <div className="flex items-center gap-1">
                <span className="text-sm font-medium">{getCurrentFormat()}</span>
                <ChevronDownIcon className="w-4 h-4" />
              </div>
            </ToolbarButton>
            {showFormatDropdown && (
              <div className="absolute top-full left-0 mt-1 z-10">
                <FormatDropdown
                  editor={editor}
                  currentFormat={getCurrentFormat()}
                  onFormatChange={() => setShowFormatDropdown(false)}
                />
              </div>
            )}
          </div>

          <div className="flex gap-1">
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBold().run()}
              isActive={editor.isActive("bold")}
              title="Bold"
            >
             <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5h4.5a3.5 3.5 0 1 1 0 7H8m0-7v7m0-7H6m2 7h6.5a3.5 3.5 0 1 1 0 7H8m0-7v7m0 0H6"></path>
                    </svg>
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleItalic().run()}
              isActive={editor.isActive("italic")}
              title="Italic"
            >
             <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m8.874 19 6.143-14M6 19h6.33m-.66-14H18"></path>
                    </svg>
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              isActive={editor.isActive("underline")}
              title="Underline"
            >
              <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                        <path stroke="currentColor" strokeLinecap="round" strokeWidth="2" d="M6 19h12M8 5v9a4 4 0 0 0 8 0V5M6 5h4m4 0h4"></path>
                    </svg>
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleStrike().run()}
              isActive={editor.isActive("strike")}
              title="Strike"
            >
              <s>S</s>
            </ToolbarButton>
          </div>          
          
          <div className="relative">
            <ToolbarButton
              onClick={() => setShowListDropdown(!showListDropdown)}
              title="Lists"
            >
              <div className="flex items-center gap-1">
                <span className="text-sm">Lists</span>
                <ChevronDownIcon className="w-4 h-4" />
              </div>
            </ToolbarButton>
            {showListDropdown && (
              <div className="absolute top-full left-0 mt-1 z-10">
                <ListDropdown
                  editor={editor}
                  onListChange={() => setShowListDropdown(false)}
                />
              </div>
            )}
          </div>

          <div className="flex gap-1">
            <ToolbarButton
              onClick={() => editor.chain().focus().setTextAlign("left").run()}
              isActive={editor.isActive({ textAlign: "left" })}
              title="Align Left"
            >
             <AlignLeftIcon className="w-5 h-5" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().setTextAlign("center").run()}
              isActive={editor.isActive({ textAlign: "center" })}
              title="Align Center"
            >
           <AlignCenterIcon className="w-5 h-5" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().setTextAlign("right").run()}
              isActive={editor.isActive({ textAlign: "right" })}
              title="Align Right"
            >
             <AlignRightIcon className="w-5 h-5" />
            </ToolbarButton>
          </div>

          <div className="flex gap-1">
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              isActive={editor.isActive("blockquote")}
              title="Quote"
            >
              <QuoteIcon className="w-5 h-5" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleCodeBlock().run()}
              isActive={editor.isActive("codeBlock")}
              title="Code Block"
            >
              <CodeBlockIcon className="w-5 h-5" />
            </ToolbarButton>
          </div>

          <div className="flex gap-1">
            <ToolbarButton
              onClick={addLink}
              title="Add Link"
            >
              <LinkIcon className="w-5 h-5" />           
               </ToolbarButton>
            {!hideImageButton && (
              <>
                <ToolbarButton
                  onClick={() => setShowImageUpload(!showImageUpload)}
                  title="Quick Image Upload"
                >
                  <ImageIcon className="w-5 h-5" />
                </ToolbarButton>
                <ToolbarButton
                  onClick={() => setShowImageResizeModal(true)}
                  title="Upload & Resize Image"
                >
                  <div className="flex items-center gap-1">
                    <ImageIcon className="w-4 h-4" />
                    <span className="text-xs">📐</span>
                  </div>
                </ToolbarButton>
              </>
            )}
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

          {mergeTags && mergeTags.length > 0 && (
            <div className="relative">
              <ToolbarButton
                onClick={() => setShowMergeTagDropdown(!showMergeTagDropdown)}
                title="Insert Merge Tag"
              >
                <div className="flex items-center gap-1">
                  <span className="text-xs font-medium">Merge tags</span>
                  <ChevronDownIcon className="w-4 h-4 shrink-0" />
                </div>
              </ToolbarButton>
              {showMergeTagDropdown && (
                <div className="absolute top-full left-0 mt-1 z-10 min-w-[160px] p-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 shadow-lg">
                  {mergeTags.map(({ label, tag }) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => {
                        editor.chain().focus().insertContent(tag).run();
                        setShowMergeTagDropdown(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <span className="block text-xs text-gray-700 dark:text-gray-300">{label}</span>
                      <span className="block text-xs text-gray-400 dark:text-gray-500 font-mono">{tag}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

           <div className="flex gap-1 ml-auto">
            <ToolbarButton
              onClick={() => editor.chain().focus().undo().run()}
              disabled={!editor.can().undo()}
              title="Undo"
            >
              <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9h13a5 5 0 0 1 0 10H7M3 9l4-4M3 9l4 4"/>
              </svg>
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().redo().run()}
              disabled={!editor.can().redo()}
              title="Redo"
            >
              <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 9H8a5 5 0 0 0 0 10h9M21 9l-4-4M21 9l-4 4"/>
              </svg>
            </ToolbarButton>
          </div>
        </div>

   
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

      {/* Image Upload with Resize Modal */}
      <ImageUploadWithResize
        isOpen={showImageResizeModal}
        onClose={() => setShowImageResizeModal(false)}
        onImageSelect={handleProcessedImageSelect}
        title="Upload and Resize Image for Blog"
      />
    </div>
  );
};

export default RichTextEditor;
