import React, { useState, useMemo } from "react";
import { NewsletterTemplate } from "../types";
import { newsletterTemplates, templateCategories } from "../templateData";
import { useNewsletter } from "../NewsletterContext";

const TemplateSelection: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const { selectTemplate, goToStep, completeStep, updateNewsletterData } = useNewsletter();

  const filteredTemplates = useMemo(() => {
    let filtered = newsletterTemplates;

    if (selectedCategory !== "all") {
      filtered = filtered.filter((template: NewsletterTemplate) => template.category === selectedCategory);
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (template: NewsletterTemplate) =>
          template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          template.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  }, [selectedCategory, searchTerm]);

  const onSelectTemplate = React.useCallback(
    (template: NewsletterTemplate) => {
      selectTemplate(template.id);
      updateNewsletterData({
        content: template.content,
        subject: template.name === "Start from scratch" ? "" : `${template.name} Newsletter`,
      });
      completeStep(1);
      goToStep(2);
    },
    [selectTemplate, updateNewsletterData, completeStep, goToStep]
  );

  const onPreviewTemplate = React.useCallback((template: NewsletterTemplate) => {
    // Open template preview in a modal or new window
    const previewWindow = window.open("", "_blank", "width=800,height=600");
    if (previewWindow) {
      previewWindow.document.write(template.content);
      previewWindow.document.close();
    }
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Select a Template</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Choose from our professionally designed templates or start from scratch to create your perfect newsletter.
        </p>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative max-w-md mx-auto">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search templates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Category Filters */}
      <div className="mb-8">
        <div className="flex flex-wrap justify-center gap-2">
          {templateCategories.map((category: any) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 text-sm font-medium rounded-full transition-colors ${
                selectedCategory === category.id
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {category.name} ({category.count})
            </button>
          ))}
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredTemplates.map((template: NewsletterTemplate) => (
          <div
            key={template.id}
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200"
          >
            {/* Template Thumbnail */}
            <div className="aspect-w-16 aspect-h-12 bg-gray-100 relative group">
              {template.id === "start-from-scratch" ? (
                <div className="flex items-center justify-center h-48 bg-gradient-to-br from-blue-50 to-indigo-100">
                  <div className="text-center">
                    <svg
                      className="mx-auto h-16 w-16 text-blue-400 mb-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1}
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      />
                    </svg>
                    <p className="text-blue-600 font-medium">Start from scratch</p>
                  </div>
                </div>
              ) : (
                <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-white rounded-lg shadow-sm mx-auto mb-2 flex items-center justify-center">
                      <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                    </div>
                    <p className="text-gray-600 text-sm font-medium">{template.name}</p>
                  </div>
                </div>
              )}

              {/* Overlay with action buttons */}
              {template.id !== "start-from-scratch" && (
                <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center space-x-2">
                  <button
                    onClick={() => onSelectTemplate(template)}
                    className="bg-white text-gray-900 px-3 py-1 rounded text-sm font-medium hover:bg-gray-100 transition-colors"
                  >
                    Choose template
                  </button>
                  <button
                    onClick={() => onPreviewTemplate(template)}
                    className="bg-blue-600 text-white px-3 py-1 rounded text-sm font-medium hover:bg-blue-700 transition-colors"
                  >
                    Preview
                  </button>
                </div>
              )}
            </div>

            {/* Template Info */}
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 mb-2">{template.name}</h3>
              <p className="text-gray-600 text-sm mb-4">{template.description}</p>

              {/* Action Buttons */}
              <div className="flex space-x-2">
                <button
                  onClick={() => onSelectTemplate(template)}
                  className="flex-1 bg-blue-600 text-white py-2 px-3 rounded text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  {template.id === "start-from-scratch" ? "Start Building" : "Use Template"}
                </button>
                {template.id !== "start-from-scratch" && (
                  <button
                    onClick={() => onPreviewTemplate(template)}
                    className="px-3 py-2 border border-gray-300 text-gray-700 rounded text-sm font-medium hover:bg-gray-50 transition-colors"
                  >
                    Preview
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredTemplates.length === 0 && (
        <div className="text-center py-12">
          <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No templates found</h3>
          <p className="text-gray-600">Try adjusting your search or category filter.</p>
        </div>
      )}
    </div>
  );
};

export default TemplateSelection;
