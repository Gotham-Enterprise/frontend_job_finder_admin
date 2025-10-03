import React, { useState, useRef } from "react";
import ImageUploadModal from "./ImageUploadModal";

interface EmailCanvasProps {
  selectedElement: string | null;
  onSelectElement: (elementId: string | null) => void;
}

interface EmailElement {
  id: string;
  type: "text" | "button" | "image" | "divider" | "social" | "html";
  content: string;
  styles: Record<string, any>;
}

const EmailCanvas: React.FC<EmailCanvasProps> = ({ selectedElement, onSelectElement }) => {
  const [elements, setElements] = useState<EmailElement[]>([
    {
      id: "header-logo",
      type: "image",
      content: "/images/logo/logo.png",
      styles: {
        backgroundColor: "#ff6b35",
        padding: "20px",
        textAlign: "center",
      },
    },
    {
      id: "main-content",
      type: "image",
      content: "/images/grid-image/whitewater-rafting.jpg",
      styles: {
        width: "100%",
        height: "300px",
        objectFit: "cover",
      },
    },
    {
      id: "main-heading",
      type: "text",
      content: "It's Been A While...",
      styles: {
        fontSize: "32px",
        fontWeight: "bold",
        color: "white",
        textAlign: "center",
        padding: "20px",
        backgroundColor: "#ff6b35",
      },
    },
  ]);

  const [showImageModal, setShowImageModal] = useState(false);
  const [editingElementId, setEditingElementId] = useState<string | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  const addElement = (type: string) => {
    const newElement: EmailElement = {
      id: `element-${Date.now()}`,
      type: type as any,
      content: getDefaultContent(type),
      styles: getDefaultStyles(type),
    };

    setElements((prev) => [...prev, newElement]);
  };

  const getDefaultContent = (type: string): string => {
    switch (type) {
      case "text":
        return "Your text here...";
      case "button":
        return "Click here";
      case "image":
        return "";
      case "divider":
        return "";
      case "social":
        return "";
      case "html":
        return "<p>Custom HTML content</p>";
      default:
        return "";
    }
  };

  const getDefaultStyles = (type: string) => {
    switch (type) {
      case "text":
        return {
          fontSize: "16px",
          color: "#333",
          padding: "15px",
          lineHeight: "1.5",
        };
      case "button":
        return {
          backgroundColor: "#ff6b35",
          color: "white",
          padding: "12px 24px",
          textAlign: "center",
          borderRadius: "4px",
          display: "inline-block",
          textDecoration: "none",
          fontWeight: "bold",
        };
      case "image":
        return {
          width: "100%",
          height: "auto",
          display: "block",
        };
      case "divider":
        return {
          height: "1px",
          backgroundColor: "#ddd",
          margin: "20px 0",
          border: "none",
        };
      case "social":
        return {
          textAlign: "center",
          padding: "20px",
        };
      default:
        return {};
    }
  };

  const updateElement = (id: string, updates: Partial<EmailElement>) => {
    setElements((prev) => prev.map((el) => (el.id === id ? { ...el, ...updates } : el)));
  };

  const deleteElement = (id: string) => {
    setElements((prev) => prev.filter((el) => el.id !== id));
    if (selectedElement === id) {
      onSelectElement(null);
    }
  };

  const duplicateElement = (id: string) => {
    const element = elements.find((el) => el.id === id);
    if (element) {
      const duplicate = {
        ...element,
        id: `element-${Date.now()}`,
      };
      setElements((prev) => [...prev, duplicate]);
    }
  };

  const uploadImage = (file: File, elementId: string) => {
    // In a real app, you would upload to a server and get back a URL
    const url = URL.createObjectURL(file);
    updateElement(elementId, { content: url });
    setShowImageModal(false);
    setEditingElementId(null);
  };

  const renderElement = (element: EmailElement) => {
    const isSelected = selectedElement === element.id;

    const baseClasses = `relative group transition-all duration-200 ${
      isSelected ? "ring-2 ring-blue-500 ring-opacity-50" : ""
    }`;

    const ElementWrapper = ({ children }: { children: React.ReactNode }) => (
      <div
        className={baseClasses}
        onClick={(e) => {
          e.stopPropagation();
          onSelectElement(element.id);
        }}
      >
        {children}

        {/* Element Controls */}
        <div
          className={`absolute top-0 right-0 bg-white border rounded-md shadow-sm transition-opacity duration-200 ${
            isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
          }`}
        >
          <div className="flex">
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (element.type === "image") {
                  setEditingElementId(element.id);
                  setShowImageModal(true);
                }
              }}
              className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-tl-md"
              title="Edit"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                duplicateElement(element.id);
              }}
              className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              title="Duplicate"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                deleteElement(element.id);
              }}
              className="p-1 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-tr-md"
              title="Delete"
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
          </div>
        </div>
      </div>
    );

    switch (element.type) {
      case "text":
        return (
          <ElementWrapper key={element.id}>
            <div
              style={element.styles}
              contentEditable
              suppressContentEditableWarning
              onBlur={(e) => {
                updateElement(element.id, { content: e.currentTarget.textContent || "" });
              }}
            >
              {element.content}
            </div>
          </ElementWrapper>
        );

      case "button":
        return (
          <ElementWrapper key={element.id}>
            <div style={{ textAlign: "center", padding: "20px" }}>
              <button
                style={element.styles}
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) => {
                  updateElement(element.id, { content: e.currentTarget.textContent || "" });
                }}
              >
                {element.content}
              </button>
            </div>
          </ElementWrapper>
        );

      case "image":
        return (
          <ElementWrapper key={element.id}>
            <div style={element.styles}>
              {element.content ? (
                <img
                  src={element.content}
                  alt="Email content"
                  style={{ width: "100%", height: "auto", display: "block" }}
                />
              ) : (
                <div
                  className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:bg-gray-50"
                  onClick={() => {
                    setEditingElementId(element.id);
                    setShowImageModal(true);
                  }}
                >
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <p className="mt-2 text-sm text-gray-600">Click to upload image</p>
                </div>
              )}
            </div>
          </ElementWrapper>
        );

      case "divider":
        return (
          <ElementWrapper key={element.id}>
            <hr style={element.styles} />
          </ElementWrapper>
        );

      case "social":
        return (
          <ElementWrapper key={element.id}>
            <div style={element.styles}>
              <div className="flex justify-center space-x-4">
                <a href="#" className="text-blue-600 hover:text-blue-800">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                  </svg>
                </a>
                <a href="#" className="text-blue-600 hover:text-blue-800">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z" />
                  </svg>
                </a>
                <a href="#" className="text-blue-600 hover:text-blue-800">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                </a>
              </div>
            </div>
          </ElementWrapper>
        );

      case "html":
        return (
          <ElementWrapper key={element.id}>
            <div style={element.styles} dangerouslySetInnerHTML={{ __html: element.content }} />
          </ElementWrapper>
        );

      default:
        return null;
    }
  };

  // Listen for drag and drop from sidebar
  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
    };

    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      const elementType = e.dataTransfer?.getData("text/plain");
      if (elementType) {
        addElement(elementType);
      }
    };

    canvas.addEventListener("dragover", handleDragOver);
    canvas.addEventListener("drop", handleDrop);

    return () => {
      canvas.removeEventListener("dragover", handleDragOver);
      canvas.removeEventListener("drop", handleDrop);
    };
  }, []);

  // Listen for element additions from sidebar
  React.useEffect(() => {
    if (selectedElement && !elements.find((el) => el.id === selectedElement)) {
      // If an element type is selected from sidebar, add it
      const elementTypes = ["text", "button", "image", "social", "html", "divider"];
      if (elementTypes.includes(selectedElement)) {
        addElement(selectedElement);
        onSelectElement(null);
      }
    }
  }, [selectedElement]);

  return (
    <div className="h-full flex flex-col bg-gray-100">
      {/* Canvas Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600">Contents</span>
          <span className="text-sm text-gray-400">•</span>
          <span className="text-sm text-gray-600">Image</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">Estimated size: 37.8K</span>
        </div>
      </div>

      {/* Email Preview */}
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-2xl mx-auto">
          {/* Email Container with Email Client Mockup */}
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
            {/* Email Client Mockup Header */}
            <div className="bg-gray-100 px-4 py-2 border-b border-gray-200">
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
                <div className="flex-1 text-center">
                  <div className="bg-white rounded px-2 py-1 text-xs text-gray-600 inline-block">Email Preview</div>
                </div>
              </div>
            </div>

            {/* Email Headers */}
            <div className="bg-white px-4 py-3 border-b border-gray-200 text-sm">
              <div className="space-y-1">
                <div className="flex">
                  <span className="text-gray-500 w-16">From:</span>
                  <span className="text-gray-900">MyApp Team &lt;newsletter@myapp.com&gt;</span>
                </div>
                <div className="flex">
                  <span className="text-gray-500 w-16">To:</span>
                  <span className="text-gray-900">recipient@example.com</span>
                </div>
                <div className="flex">
                  <span className="text-gray-500 w-16">Subject:</span>
                  <span className="text-gray-900 font-medium">MacBook Pro Newsletter</span>
                </div>
              </div>
            </div>

            {/* Email Content */}
            <div
              ref={canvasRef}
              className="bg-white overflow-y-auto cursor-pointer"
              onClick={() => onSelectElement(null)}
              style={{ backgroundColor: "#EEEEEE" }}
            >
              <div className="bg-white mx-auto max-w-xl">
                {elements.map(renderElement)}

                {/* Add Content Placeholder */}
                {elements.length === 0 && (
                  <div className="p-12 text-center text-gray-500">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400 mb-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      />
                    </svg>
                    <p>Drag elements from the sidebar to start building your email</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Image Upload Modal */}
      {showImageModal && editingElementId && (
        <ImageUploadModal
          isOpen={showImageModal}
          onClose={() => {
            setShowImageModal(false);
            setEditingElementId(null);
          }}
          onUpload={(file: File) => uploadImage(file, editingElementId)}
        />
      )}
    </div>
  );
};

export default EmailCanvas;
