import React, { useState, useMemo } from "react";
import { NewsletterTemplate } from "../types";
import { emailTemplates, getTemplateById } from "../emailTemplates";
import { useAppDispatch } from "@/store";
import {
  setSelectedTemplate,
  setContent,
  setDesign,
  completeStep,
  setCurrentStep,
} from "@/store/slices/newsletterSlice";
import TemplatePreview from "../components/TemplatePreview";
import SimpleTemplateThumbnail from "../components/SimpleTemplateThumbnail";

// Template categories for the new email templates
const templateCategories = [
  { id: "all", name: "All Templates" },
  { id: "welcome", name: "Welcome" },
  { id: "newsletter", name: "Newsletter" },
  { id: "product", name: "Product" },
  { id: "engagement", name: "Engagement" },
  { id: "event", name: "Event" },
  { id: "ecommerce", name: "E-commerce" },
];

const TemplateSelection: React.FC = () => {
  const dispatch = useAppDispatch();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [previewTemplate, setPreviewTemplate] = useState<NewsletterTemplate | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Convert email templates to newsletter template format
  const newsletterTemplates: NewsletterTemplate[] = [
    {
      id: "blank",
      name: "Start from scratch",
      category: "newsletter",
      thumbnail: "/images/templates/blank-template.png",
      description: "Create your own design from scratch",
      content: "",
      isCustom: true,
    },
    ...emailTemplates.map((template) => ({
      id: template.id,
      name: template.name,
      category: template.category,
      thumbnail: template.thumbnail,
      description: template.description,
      content: template.content || "", // Use HTML content instead of JSON design
      isCustom: false,
    })),
  ];

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
      console.log("🎯 Template selected:", template.id);

      dispatch(setSelectedTemplate(template.id));
      console.log("✅ Redux: setSelectedTemplate dispatched");

      if (template.id === "blank") {
        // For blank template, just set basic data
        dispatch(setContent(""));
        console.log("✅ Redux: setContent('') dispatched for blank template");
      } else {
        // For predefined templates, load both the content AND design
        const emailTemplate = getTemplateById(template.id);
        if (emailTemplate) {
          dispatch(setContent(emailTemplate.content || ""));
          console.log("✅ Redux: setContent dispatched with template content");

          // IMPORTANT: Also dispatch the design JSON so the editor can load it properly
          if (emailTemplate.design) {
            dispatch(setDesign(emailTemplate.design));
            console.log("✅ Redux: setDesign dispatched with template design JSON");
          }
        }
      }

      dispatch(completeStep(1));
      console.log("✅ Redux: completeStep(1) dispatched");

      dispatch(setCurrentStep(2));
      console.log("✅ Redux: setCurrentStep(2) dispatched - Should navigate to Edit step now!");
    },
    [dispatch]
  );

  const onPreviewTemplate = React.useCallback((template: NewsletterTemplate) => {
    setPreviewTemplate(template);
    setIsPreviewOpen(true);
  }, []);

  const closePreview = React.useCallback(() => {
    setIsPreviewOpen(false);
    setPreviewTemplate(null);
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
                  ? "bg-primary text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* Removed xl:grid-cols-4 for larger thumbnails */}
        {filteredTemplates.map((template: NewsletterTemplate) => (
          <SimpleTemplateThumbnail
            key={template.id}
            template={template}
            onSelect={() => onSelectTemplate(template)}
            onPreview={() => onPreviewTemplate(template)}
          />
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

      {/* Template Preview Modal */}
      {previewTemplate && (
        <TemplatePreview
          template={previewTemplate}
          isOpen={isPreviewOpen}
          onClose={closePreview}
          onSelectTemplate={onSelectTemplate}
        />
      )}
    </div>
  );
};

export default TemplateSelection;
