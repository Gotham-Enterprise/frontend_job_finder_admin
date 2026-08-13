"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/button/Button";
import FullScreenSpinner from "@/components/ui/FullScreenSpinner";
import { MedicalLibraryTopic, MedicalLibrarySection, MedicalLibraryTab } from "@/services/api/medicalLibrary";
import HtmlEditorPreview from "./HtmlEditorPreview";
import { showToast } from "@/services/utils/toast";

interface MedicalLibraryFormProps {
  initialData?: MedicalLibraryTopic | null;
  onSave: (data: any, onDone: () => void) => void;
  isSaving: boolean;
}

const generateId = () => Math.random().toString(36).slice(2, 10);

const slugify = (text: string) =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

const defaultSection = (): MedicalLibrarySection => ({
  id: generateId(),
  label: "",
  html: "",
});

const defaultTab = (): MedicalLibraryTab => ({
  tabName: "",
  sections: [defaultSection()],
});

const MedicalLibraryForm: React.FC<MedicalLibraryFormProps> = ({ initialData, onSave, isSaving }) => {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [category, setCategory] = useState("Mental Health Disorders");
  const [description, setDescription] = useState("");
  const [tabs, setTabs] = useState<MedicalLibraryTab[]>([defaultTab()]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [status, setStatus] = useState("published");

  // Categories allowed per user request
  const CATEGORY_OPTIONS = [
    { value: "Mental Health Disorders", label: "Mental Health Disorders" },
    { value: "Medical Conditions", label: "Medical Conditions" },
  ];

  // Populate form when editing
  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || "");
      setSlug(initialData.slug || "");

      // Ensure category matches one of the allowed options if possible
      const incomingCategory = initialData.category || "";
      if (CATEGORY_OPTIONS.some((opt) => opt.value === incomingCategory)) {
        setCategory(incomingCategory);
      } else if (incomingCategory.toLowerCase().includes("mental")) {
        setCategory("Mental Health Disorders");
      } else if (incomingCategory) {
        setCategory("Medical Conditions");
      }

      setDescription(initialData.description || "");
      const existingTabs = initialData.content?.tabs;
      setTabs(existingTabs && existingTabs.length > 0 ? existingTabs : [defaultTab()]);
      setStatus(initialData.status || "published");
      setSlugManuallyEdited(true);
    }
  }, [initialData]);

  // Auto-generate slug from title
  useEffect(() => {
    if (!slugManuallyEdited && title) {
      setSlug(slugify(title));
    }
  }, [title, slugManuallyEdited]);

  // ── Tab Helpers ──────────────────────────────────────────────────────────

  const addTab = () => {
    if (tabs.length >= 3) {
      showToast.error("Limit Reached", "You can only add a maximum of 3 content tabs.");
      return;
    }
    setTabs((prev) => [...prev, defaultTab()]);
  };

  const removeTab = (tabIdx: number) => setTabs((prev) => prev.filter((_, i) => i !== tabIdx));

  const updateTabName = (tabIdx: number, name: string) =>
    setTabs((prev) => prev.map((t, i) => (i === tabIdx ? { ...t, tabName: name } : t)));

  const addSection = (tabIdx: number) =>
    setTabs((prev) => prev.map((t, i) => (i === tabIdx ? { ...t, sections: [...t.sections, defaultSection()] } : t)));

  const removeSection = (tabIdx: number, secIdx: number) =>
    setTabs((prev) =>
      prev.map((t, i) => (i === tabIdx ? { ...t, sections: t.sections.filter((_, si) => si !== secIdx) } : t))
    );

  const updateSection = (tabIdx: number, secIdx: number, field: keyof MedicalLibrarySection, value: string) =>
    setTabs((prev) =>
      prev.map((t, i) =>
        i === tabIdx
          ? {
              ...t,
              sections: t.sections.map((s, si) => (si === secIdx ? { ...s, [field]: value } : s)),
            }
          : t
      )
    );

  // ── Submit ────────────────────────────────────────────────────────────────

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !slug.trim() || !category.trim() || !description.trim()) {
      showToast.error("Missing fields", "Please fill in all required fields");
      return;
    }

    if (tabs.length > 3) {
      showToast.error("Limit Exceeded", "You cannot exceed the maximum limit of 3 content tabs.");
      return;
    }

    for (let i = 0; i < tabs.length; i++) {
      const tab = tabs[i];
      if (!tab.tabName.trim()) {
        showToast.error("Missing fields", `Please enter a name for Tab ${i + 1}.`);
        return;
      }
      if (!tab.sections.some((s) => s.html.trim())) {
        showToast.error("Missing fields", `Please add content to the "${tab.tabName.trim()}" tab.`);
        return;
      }
    }

    setIsSubmitting(true);
    const payload = {
      title: title.trim(),
      slug: slug.trim(),
      category: category.trim(),
      description: description.trim(),
      status: status,
      content: { tabs },
    };

    onSave(payload, () => setIsSubmitting(false));
  };

  const handleBackClick = () => {
    router.push("/admin/medical-library");
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            onClick={handleBackClick}
            variant="ghost"
            className="text-gray-500 hover:text-gray-900 dark:hover:text-white"
          >
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </Button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {initialData ? "Edit Topic" : "Add New Topic"}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={handleBackClick} disabled={isSubmitting || isSaving}>
            Cancel
          </Button>
          <Button
            onClick={() => handleSubmit({ preventDefault: () => {} } as React.FormEvent)}
            disabled={isSubmitting || isSaving}
            className="flex items-center gap-2"
          >
            {(isSubmitting || isSaving) && (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            )}
            {initialData ? "Save Changes" : "Create Topic"}
          </Button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden">
        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-8">
          {/* Basic Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                placeholder="e.g. Anxiety Disorders"
                className="w-full px-4 py-3 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Slug <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={slug}
                onChange={(e) => {
                  setSlugManuallyEdited(true);
                  setSlug(e.target.value);
                }}
                required
                placeholder="e.g. anxiety-disorders"
                className="w-full px-4 py-3 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
              />
              <p className="text-xs text-gray-400 mt-1.5 ml-1">Used in the URL. Auto-generated from title.</p>
            </div>

            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Category <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-3 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                >
                  {CATEGORY_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-gray-500">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Status <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-4 py-3 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                >
                  <option value="published">Publish</option>
                  <option value="draft">Draft</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-gray-500">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                placeholder="Short summary shown in listings"
                rows={2}
                className="w-full px-4 py-3 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
              />
            </div>
          </div>

          <div className="my-8 border-t border-gray-200 dark:border-gray-800"></div>

          {/* Tabs Builder */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Content Structure <span className="text-red-500">*</span>
              </h3>
              <button
                type="button"
                onClick={addTab}
                disabled={tabs.length >= 3}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium border rounded-lg transition ${
                  tabs.length >= 3
                    ? "border-gray-200 text-gray-400 bg-gray-50 cursor-not-allowed dark:border-gray-700 dark:text-gray-500 dark:bg-gray-800"
                    : "border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
                title={tabs.length >= 3 ? "Maximum of 3 tabs allowed" : "Add a new tab"}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Content Tab
              </button>
            </div>

            <div className="space-y-8">
              {tabs.map((tab, tabIdx) => (
                <div
                  key={tabIdx}
                  className="border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden bg-gray-50 dark:bg-gray-800/20"
                >
                  {/* Tab Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700/50">
                    <div className="flex-1 w-full relative">
                      <label className="absolute -top-2 left-2 px-1 bg-white dark:bg-gray-800 text-xs font-medium text-blue-600 dark:text-blue-400">
                        Tab Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={tab.tabName}
                        onChange={(e) => updateTabName(tabIdx, e.target.value)}
                        placeholder={`e.g. Overview or Symptoms`}
                        className="w-full px-4 py-2.5 text-sm font-semibold bg-transparent text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    {tabs.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeTab(tabIdx)}
                        className="px-3 py-2.5 text-sm font-medium text-red-600 bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                        <span className="hidden sm:inline">Delete Tab</span>
                      </button>
                    )}
                  </div>

                  {/* Sections */}
                  <div className="p-5 space-y-6">
                    {tab.sections.map((section, secIdx) => (
                      <div
                        key={section.id}
                        className="rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800/80 shadow-sm overflow-hidden"
                      >
                        <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-900/20">
                          <input
                            type="text"
                            value={section.label}
                            onChange={(e) => updateSection(tabIdx, secIdx, "label", e.target.value)}
                            placeholder={`Section Heading (Optional)`}
                            className="flex-1 text-sm font-medium text-gray-800 dark:text-gray-200 bg-transparent focus:outline-none placeholder-gray-400"
                          />
                          {tab.sections.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeSection(tabIdx, secIdx)}
                              className="ml-3 p-1.5 text-gray-400 hover:text-red-500 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                              title="Remove section"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M6 18L18 6M6 6l12 12"
                                />
                              </svg>
                            </button>
                          )}
                        </div>

                        <div className="p-4 bg-white dark:bg-gray-800">
                          <HtmlEditorPreview
                            initialHtml={section.html}
                            onChange={(newHtml) => updateSection(tabIdx, secIdx, "html", newHtml)}
                            placeholder="Write raw HTML code here... e.g. <h3>Header</h3><p>Text...</p>"
                          />
                        </div>
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={() => addSection(tabIdx)}
                      className="w-full flex items-center justify-center gap-2 py-3 text-sm font-medium rounded-xl border border-dashed border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800/50 text-gray-600 dark:text-gray-400 hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Add Section to {tab.tabName || "this Tab"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </form>
      </div>

      <FullScreenSpinner isVisible={isSubmitting || isSaving} message="Saving Topic..." />
    </div>
  );
};

export default MedicalLibraryForm;
