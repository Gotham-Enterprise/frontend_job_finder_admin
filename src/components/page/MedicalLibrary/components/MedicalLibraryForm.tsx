"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/button/Button";
import FullScreenSpinner from "@/components/ui/FullScreenSpinner";
import {
  MedicalLibraryTopic,
  MedicalLibrarySection,
  MedicalLibraryTab,
  MedicalLibraryCode,
  getSourceLabel,
  medicalLibraryApi,
} from "@/services/api/medicalLibrary";
import HtmlEditorPreview from "./HtmlEditorPreview";
import PendingChangesPanel from "./PendingChangesPanel";
import Icd10CodePicker from "./Icd10CodePicker";
import { showToast } from "@/services/utils/toast";

interface MedicalLibraryFormProps {
  initialData?: MedicalLibraryTopic | null;
  onSave: (data: any, onDone: (apiErrorMessage?: string) => void) => void;
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

const ICD10_CODE_PATTERN = /^[A-Z]\d{2}(\.[A-Z0-9]{1,4})?$/;

/** Trims, uppercases codes, drops empty rows and duplicates; keeps entry order. */
const cleanCodes = (list: MedicalLibraryCode[]): MedicalLibraryCode[] => {
  const seen = new Set<string>();
  return list
    .map((c) => ({ system: "ICD-10-CM", code: c.code.trim().toUpperCase(), name: c.name.trim(), primary: Boolean(c.primary) }))
    .filter((c) => c.code && !seen.has(c.code) && seen.add(c.code));
};

// Read-only provenance for imported rows. The importer owns the content: if
// the source page changes, the next run overwrites title/description/content
// and re-queues the topic as draft (the Pending Changes panel then shows old
// vs new). Status and slug are the admin's — the importer never touches them
// on an unchanged topic.
const ImportedSourcePanel: React.FC<{ topic: MedicalLibraryTopic }> = ({ topic }) => {
  const label = getSourceLabel(topic.source);
  const sourceSite = topic.source === "medlineplus" ? "MedlinePlus.gov" : topic.source === "nami" ? "NAMI.org" : label;
  return (
    <div className="rounded-2xl border border-teal-200 bg-teal-50 p-5 dark:border-teal-500/20 dark:bg-teal-500/10">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-teal-700 dark:text-teal-400">
            Imported from {label}
          </p>
          <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
            {topic.source === "medlineplus"
              ? `Title, category, description and content are maintained by the ${label} import and are read-only here. If the source page changes, the next import replaces them and sets the topic back to draft for review. Status and slug are yours to change and are kept across imports.`
              : `Content on this page is maintained by the ${label} import. If the source page changes, the next import replaces the title, description and content here and sets the topic back to draft for review. Your status and slug are kept.`}
          </p>
          {topic.sourceUrl && (
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              Source URL: <code className="break-all">{topic.sourceUrl}</code>
            </p>
          )}
          {topic.relatedTopics && topic.relatedTopics.length > 0 && (
            <div className="mt-4">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-teal-700 dark:text-teal-400">
                Related topics from {label} ({topic.relatedTopics.length})
              </p>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Shown as &quot;Related Conditions&quot; on the public page once published. Maintained by the import.
              </p>
              <ul className="mt-2 flex flex-wrap gap-2">
                {topic.relatedTopics.map((rel) => {
                  const tone =
                    rel.status === "published"
                      ? "border-green-200 bg-green-50 text-green-800 dark:border-green-500/30 dark:bg-green-500/10 dark:text-green-300"
                      : rel.status === "draft"
                        ? "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300"
                        : "border-gray-200 bg-gray-50 text-gray-500 dark:border-gray-700 dark:bg-gray-800/40 dark:text-gray-400";
                  const note =
                    rel.status === "published" ? "published" : rel.status === "draft" ? "draft, hidden until published" : "not imported, not shown";
                  const chip = (
                    <span className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs ${tone}`} title={note}>
                      {rel.title}
                      <span className="opacity-70">· {rel.status || "not imported"}</span>
                    </span>
                  );
                  return (
                    <li key={rel.sourceUrl}>
                      {rel.id ? (
                        <a href={`/admin/medical-library/edit/${rel.id}`} className="hover:opacity-80">
                          {chip}
                        </a>
                      ) : (
                        chip
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
        {topic.sourceUrl && (
          <a
            href={topic.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-teal-300 bg-white px-3 py-2 text-sm font-medium text-teal-800 hover:bg-teal-100 dark:border-teal-500/30 dark:bg-transparent dark:text-teal-300 dark:hover:bg-teal-500/10"
          >
            View on {sourceSite}
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
          </a>
        )}
      </div>
    </div>
  );
};

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
  const [errors, setErrors] = useState<Record<string, string>>({});
  // ICD-10-CM codes for topics whose import does not supply them (NAMI,
  // hand-written). MedlinePlus topics get theirs from the importer and show
  // them read-only in the Imported Source panel instead.
  const [codes, setCodes] = useState<MedicalLibraryCode[]>([]);
  const [isSuggestingCodes, setIsSuggestingCodes] = useState(false);
  // For imported topics: "import" = the importer manages the codes and may
  // change them on the next run; "curated" = an admin edited them, so the
  // importer leaves them alone. codesFromImport is the importer's own list,
  // kept so a curated topic can be reset to it. codesTouched gates whether
  // the save sends codes at all (an untouched import-managed list is not
  // re-sent, so nothing can drift).
  const [codesMode, setCodesMode] = useState<"import" | "curated">("import");
  const [codesFromImport, setCodesFromImport] = useState<MedicalLibraryCode[]>([]);
  const [codesTouched, setCodesTouched] = useState(false);

  const changeCodes = (updater: (prev: MedicalLibraryCode[]) => MedicalLibraryCode[]) => {
    clearError("codes");
    setCodes(updater);
    setCodesTouched(true);
    if (isImported) setCodesMode("curated");
  };

  const resetCodesToImport = () => {
    clearError("codes");
    setCodes(codesFromImport);
    setCodesMode("import");
    setCodesTouched(true);
  };

  // MedlinePlus topics are owned by the importer: title, category,
  // description and content get overwritten on the next run whenever the
  // source page differs, so editing them here would be lost and would flip
  // the topic back to draft. Those fields are read-only for MedlinePlus rows;
  // only status and slug are the admin's to change. NAMI topics keep the
  // original fully editable form (product decision 2026-11-24), even though
  // the same re-import rule applies to them.
  const isImported = initialData?.source === "medlineplus";
  const readOnlyFieldClass = isImported
    ? "disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed dark:disabled:bg-gray-800/40 dark:disabled:text-gray-400"
    : "";

  const clearError = (key: string) =>
    setErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });

  // Tab errors are keyed by index, so drop them whenever tabs are added or
  // removed and the indices shift.
  const clearTabErrors = () =>
    setErrors((prev) => Object.fromEntries(Object.entries(prev).filter(([key]) => !key.startsWith("tab-"))));

  const scrollToFirstError = () =>
    requestAnimationFrame(() => {
      document.querySelector("[data-field-error]")?.scrollIntoView({ behavior: "smooth", block: "center" });
    });

  // Server-side rejections (e.g. a duplicate slug) name the offending field in
  // their message — surface those on the field itself, not just in the toast.
  const applyApiError = (message: string) => {
    const lower = message.toLowerCase();
    const key = lower.includes("slug")
      ? "slug"
      : lower.includes("description")
        ? "description"
        : lower.includes("title")
          ? "title"
          : null;
    if (!key) return;
    setErrors((prev) => ({ ...prev, [key]: message }));
    scrollToFirstError();
  };

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
      const storedCodes = Array.isArray(initialData.content?.codes) ? initialData.content.codes : [];
      setCodes(storedCodes);
      const curated = Boolean(initialData.content?.codesCurated);
      setCodesMode(curated ? "curated" : "import");
      // While import-managed, the stored codes ARE the import's list.
      setCodesFromImport(
        curated && Array.isArray(initialData.content?.codesFromImport) ? initialData.content.codesFromImport : storedCodes
      );
      setCodesTouched(false);
      setSlugManuallyEdited(true);
    }
  }, [initialData]);

  // Auto-generate slug from title
  useEffect(() => {
    if (!slugManuallyEdited && title) {
      setSlug(slugify(title));
      clearError("slug");
    }
  }, [title, slugManuallyEdited]);

  // ── Tab Helpers ──────────────────────────────────────────────────────────

  const addTab = () => {
    if (tabs.length >= 3) {
      showToast.error("Limit Reached", "You can only add a maximum of 3 content tabs.");
      return;
    }
    clearTabErrors();
    setTabs((prev) => [...prev, defaultTab()]);
  };

  const removeTab = (tabIdx: number) => {
    clearTabErrors();
    setTabs((prev) => prev.filter((_, i) => i !== tabIdx));
  };

  const updateTabName = (tabIdx: number, name: string) => {
    clearError(`tab-${tabIdx}-name`);
    setTabs((prev) => prev.map((t, i) => (i === tabIdx ? { ...t, tabName: name } : t)));
  };

  const addSection = (tabIdx: number) =>
    setTabs((prev) => prev.map((t, i) => (i === tabIdx ? { ...t, sections: [...t.sections, defaultSection()] } : t)));

  const removeSection = (tabIdx: number, secIdx: number) =>
    setTabs((prev) =>
      prev.map((t, i) => (i === tabIdx ? { ...t, sections: t.sections.filter((_, si) => si !== secIdx) } : t))
    );

  const updateSection = (tabIdx: number, secIdx: number, field: keyof MedicalLibrarySection, value: string) => {
    if (field === "html" && value.trim()) clearError(`tab-${tabIdx}-content`);
    return setTabs((prev) =>
      prev.map((t, i) =>
        i === tabIdx
          ? {
              ...t,
              sections: t.sections.map((s, si) => (si === secIdx ? { ...s, [field]: value } : s)),
            }
          : t
      )
    );
  };

  // ── ICD-10 codes ──────────────────────────────────────────────────────────

  const updateCode = (index: number, patch: Partial<MedicalLibraryCode>) => {
    changeCodes((prev) => prev.map((c, i) => (i === index ? { ...c, ...patch } : c)));
  };

  const handleSuggestCodes = async () => {
    if (!title.trim()) return;
    setIsSuggestingCodes(true);
    try {
      const res = await medicalLibraryApi.suggestCodes(title.trim());
      const suggested = res?.data?.codes || [];
      if (suggested.length === 0) {
        showToast.error("No suggestions", `No ICD-10-CM code is known for "${title.trim()}". Add one by hand if you have it.`);
        return;
      }
      // Merge: keep what the admin already typed, add suggestions not present yet.
      const existing = new Set(cleanCodes(codes).map((c) => c.code));
      const added = suggested.filter((c) => !existing.has(c.code.toUpperCase()));
      if (added.length) changeCodes((prev) => [...prev, ...added]);
      showToast.success(
        added.length ? "Codes suggested" : "Already listed",
        added.length ? `${added.length} code${added.length === 1 ? "" : "s"} added — review before saving.` : "Every suggested code is already in the list."
      );
    } catch (err: any) {
      showToast.error("Lookup failed", err?.message || "Could not fetch code suggestions");
    } finally {
      setIsSuggestingCodes(false);
    }
  };

  // ── Submit ────────────────────────────────────────────────────────────────

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Imported row: only slug, status and (when the admin touched them) the
    // ICD-10 codes are sent. Re-sending the rest of the content (even
    // unchanged) risks editor normalisation drifting it from what the
    // importer wrote, which the next import would read as a change. The
    // backend merges content keys, so sending codes alone leaves tabs,
    // synonyms and related untouched.
    if (isImported) {
      const nextErrors: Record<string, string> = {};
      if (!slug.trim()) nextErrors.slug = "Slug is required";
      setErrors(nextErrors);
      if (Object.keys(nextErrors).length > 0) {
        scrollToFirstError();
        return;
      }
      setIsSubmitting(true);
      const payload: any = { slug: slug.trim(), status };
      if (codesTouched) {
        payload.content =
          codesMode === "curated"
            ? { codes: cleanCodes(codes), codesCurated: true, codesFromImport }
            : { codes: cleanCodes(codesFromImport), codesCurated: false, codesFromImport: null };
      }
      onSave(payload, (apiErrorMessage?: string) => {
        setIsSubmitting(false);
        if (apiErrorMessage) applyApiError(apiErrorMessage);
      });
      return;
    }

    if (tabs.length > 3) {
      showToast.error("Limit Exceeded", "You cannot exceed the maximum limit of 3 content tabs.");
      return;
    }

    const nextErrors: Record<string, string> = {};
    if (!title.trim()) nextErrors.title = "Title is required";
    if (!slug.trim()) nextErrors.slug = "Slug is required";
    if (!category.trim()) nextErrors.category = "Category is required";
    if (!description.trim()) nextErrors.description = "Description is required";
    const badCode = codes.find((c) => c.code.trim() && !ICD10_CODE_PATTERN.test(c.code.trim().toUpperCase()));
    if (badCode) nextErrors.codes = `"${badCode.code}" is not a valid ICD-10-CM code (expected a form like F41.1 or J45.909)`;
    tabs.forEach((tab, i) => {
      if (!tab.tabName.trim()) nextErrors[`tab-${i}-name`] = "Tab name is required";
      if (!tab.sections.some((s) => s.html.trim())) {
        nextErrors[`tab-${i}-content`] = "Add content to at least one section in this tab";
      }
    });

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      showToast.error("Missing fields", "Please fill in the highlighted fields");
      scrollToFirstError();
      return;
    }

    setIsSubmitting(true);
    const payload = {
      title: title.trim(),
      slug: slug.trim(),
      category: category.trim(),
      description: description.trim(),
      status: status,
      content: { tabs, codes: cleanCodes(codes) },
    };

    onSave(payload, (apiErrorMessage?: string) => {
      setIsSubmitting(false);
      if (apiErrorMessage) applyApiError(apiErrorMessage);
    });
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

      {initialData?.source && <ImportedSourcePanel topic={initialData} />}

      {initialData?.previousVersion && (
        <PendingChangesPanel previousVersion={initialData.previousVersion} current={initialData} />
      )}

      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden">
        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-8">
          {/* Basic Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div data-field-error={errors.title ? true : undefined}>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                disabled={isImported}
                onChange={(e) => {
                  setTitle(e.target.value);
                  clearError("title");
                }}
                placeholder="e.g. Anxiety Disorders"
                className={`w-full px-4 py-3 text-sm border rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 ${readOnlyFieldClass} ${
                  errors.title ? "border-red-500 focus:ring-red-500" : "border-gray-200 dark:border-gray-700 focus:ring-blue-500"
                }`}
              />
              {errors.title && <p className="text-xs text-red-500 mt-1.5 ml-1">{errors.title}</p>}
            </div>

            <div data-field-error={errors.slug ? true : undefined}>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Slug <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={slug}
                onChange={(e) => {
                  setSlugManuallyEdited(true);
                  setSlug(e.target.value);
                  clearError("slug");
                }}
                placeholder="e.g. anxiety-disorders"
                className={`w-full px-4 py-3 text-sm border rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 font-mono ${
                  errors.slug ? "border-red-500 focus:ring-red-500" : "border-gray-200 dark:border-gray-700 focus:ring-blue-500"
                }`}
              />
              {errors.slug && <p className="text-xs text-red-500 mt-1.5 ml-1">{errors.slug}</p>}
              <p className="text-xs text-gray-400 mt-1.5 ml-1">Used in the URL. Auto-generated from title.</p>
            </div>

            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Category <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  value={category}
                  disabled={isImported}
                  onChange={(e) => setCategory(e.target.value)}
                  className={`w-full px-4 py-3 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none ${readOnlyFieldClass}`}
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

            <div className="md:col-span-2" data-field-error={errors.description ? true : undefined}>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                value={description}
                disabled={isImported}
                onChange={(e) => {
                  setDescription(e.target.value);
                  clearError("description");
                }}
                placeholder="Short summary shown in listings"
                rows={2}
                className={`w-full px-4 py-3 text-sm border rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 resize-y ${readOnlyFieldClass} ${
                  errors.description ? "border-red-500 focus:ring-red-500" : "border-gray-200 dark:border-gray-700 focus:ring-blue-500"
                }`}
              />
              {errors.description && <p className="text-xs text-red-500 mt-1.5 ml-1">{errors.description}</p>}
            </div>

            {/* ICD-10-CM codes — editable for every topic. On imported topics an
                edit switches the list to "curated" and the importer stops touching it. */}
            <div className="md:col-span-2" data-field-error={errors.codes ? true : undefined}>
                <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    ICD-10-CM codes <span className="text-xs font-normal text-gray-400">(optional)</span>
                    {isImported && (
                      <span
                        className={`ml-2 align-middle rounded-md border px-2 py-0.5 text-[11px] font-medium ${
                          codesMode === "curated"
                            ? "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300"
                            : "border-teal-200 bg-teal-50 text-teal-700 dark:border-teal-500/20 dark:bg-teal-500/10 dark:text-teal-400"
                        }`}
                        title={
                          codesMode === "curated"
                            ? "An admin edited these codes; the import will not change them."
                            : "These codes come from the import and may change when the source changes."
                        }
                      >
                        {codesMode === "curated" ? "Curated by admin — import won't change these" : `From ${getSourceLabel(initialData?.source)} import`}
                      </span>
                    )}
                  </label>
                  <div className="flex items-center gap-2">
                    {isImported && codesMode === "curated" && (
                      <button
                        type="button"
                        onClick={resetCodesToImport}
                        className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                        title="Discard the edits and let the import manage these codes again"
                      >
                        Reset to import suggestions
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={handleSuggestCodes}
                      disabled={isSuggestingCodes || !title.trim()}
                      title={!title.trim() ? "Enter a title first" : "Look up codes for this title"}
                      className="px-3 py-1.5 text-xs font-medium rounded-lg border border-teal-300 text-teal-800 bg-teal-50 hover:bg-teal-100 disabled:opacity-50 disabled:cursor-not-allowed dark:border-teal-500/30 dark:bg-teal-500/10 dark:text-teal-300"
                    >
                      {isSuggestingCodes ? "Looking up…" : "Suggest codes for this title"}
                    </button>
                  </div>
                </div>

                {/* Picked codes: code and official name come from the NLM list and are not typed. */}
                {codes.length > 0 && (
                  <ul className="mb-2 space-y-1.5">
                    {codes.map((c, i) => (
                      <li
                        key={`${c.code}-${i}`}
                        className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 dark:border-gray-700 dark:bg-gray-800/40"
                      >
                        <code className="font-mono text-sm font-semibold text-gray-900 dark:text-white">{c.code}</code>
                        <span className="min-w-0 flex-1 truncate text-sm text-gray-700 dark:text-gray-300" title={c.name}>
                          {c.name || <span className="italic text-gray-400">name unknown</span>}
                        </span>
                        <label className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-300 whitespace-nowrap">
                          <input type="checkbox" checked={c.primary} onChange={(e) => updateCode(i, { primary: e.target.checked })} />
                          Primary
                        </label>
                        <button
                          type="button"
                          onClick={() => changeCodes((prev) => prev.filter((_, j) => j !== i))}
                          className="p-1 text-gray-400 hover:text-red-500 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20"
                          title="Remove code"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}

                <Icd10CodePicker
                  excludeCodes={codes.map((c) => c.code)}
                  onPick={(hit) =>
                    changeCodes((prev) => [...prev, { system: "ICD-10-CM", code: hit.code, name: hit.name, primary: prev.length === 0 }])
                  }
                />
                <p className="mt-1.5 ml-1 text-xs text-gray-400">
                  Search the official ICD-10-CM list by code or condition name and pick from the dropdown. Primary = the
                  condition itself; unchecked = a related code. Shown on the public page as reference only, not billing guidance.
                </p>
                {errors.codes && <p className="text-xs text-red-500 mt-1.5 ml-1">{errors.codes}</p>}
            </div>
          </div>

          <div className="my-8 border-t border-gray-200 dark:border-gray-800"></div>

          {/* Tabs Builder */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Content Structure {isImported ? (
                  <span className="ml-2 align-middle text-xs font-medium text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-500/10 border border-teal-200 dark:border-teal-500/20 rounded-md px-2 py-0.5">
                    Read-only, maintained by {getSourceLabel(initialData?.source)}
                  </span>
                ) : (
                  <span className="text-red-500">*</span>
                )}
              </h3>
              {!isImported && (
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
              )}
            </div>

            <div className="space-y-8">
              {tabs.map((tab, tabIdx) => (
                <div
                  key={tabIdx}
                  data-field-error={errors[`tab-${tabIdx}-content`] ? true : undefined}
                  className={`border rounded-2xl overflow-hidden bg-gray-50 dark:bg-gray-800/20 ${
                    errors[`tab-${tabIdx}-content`] ? "border-red-500" : "border-gray-200 dark:border-gray-700"
                  }`}
                >
                  {/* Tab Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700/50">
                    <div className="flex-1 w-full relative" data-field-error={errors[`tab-${tabIdx}-name`] ? true : undefined}>
                      <label className="absolute -top-2 left-2 px-1 bg-white dark:bg-gray-800 text-xs font-medium text-blue-600 dark:text-blue-400">
                        Tab Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={tab.tabName}
                        disabled={isImported}
                        onChange={(e) => updateTabName(tabIdx, e.target.value)}
                        placeholder={`e.g. Overview or Symptoms`}
                        className={`w-full px-4 py-2.5 text-sm font-semibold bg-transparent text-gray-900 dark:text-white border rounded-lg focus:outline-none disabled:text-gray-500 disabled:cursor-not-allowed ${
                          errors[`tab-${tabIdx}-name`] ? "border-red-500 focus:border-red-500" : "border-gray-300 dark:border-gray-600 focus:border-blue-500"
                        }`}
                      />
                      {errors[`tab-${tabIdx}-name`] && (
                        <p className="text-xs text-red-500 mt-1.5 ml-1">{errors[`tab-${tabIdx}-name`]}</p>
                      )}
                    </div>
                    {tabs.length > 1 && !isImported && (
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
                    {errors[`tab-${tabIdx}-content`] && (
                      <p className="text-xs text-red-500">{errors[`tab-${tabIdx}-content`]}</p>
                    )}
                    {tab.sections.map((section, secIdx) => (
                      <div
                        key={section.id}
                        className="rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800/80 shadow-sm overflow-hidden"
                      >
                        <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-900/20">
                          <input
                            type="text"
                            value={section.label}
                            disabled={isImported}
                            onChange={(e) => updateSection(tabIdx, secIdx, "label", e.target.value)}
                            placeholder={`Section Heading (Optional)`}
                            className="flex-1 text-sm font-medium text-gray-800 dark:text-gray-200 bg-transparent focus:outline-none placeholder-gray-400 disabled:cursor-not-allowed"
                          />
                          {tab.sections.length > 1 && !isImported && (
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
                          {isImported ? (
                            // Rendered preview instead of the editor: the HTML was sanitized
                            // by the backend on import and only the importer may change it.
                            <div
                              className="text-sm leading-relaxed text-gray-800 dark:text-gray-200 space-y-3 [&_h3]:text-base [&_h3]:font-semibold [&_h4]:font-semibold [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:mt-1 [&_a]:text-blue-600 [&_a]:underline dark:[&_a]:text-blue-400 [&_table]:w-full [&_td]:border [&_td]:p-2 [&_th]:border [&_th]:p-2"
                              dangerouslySetInnerHTML={{ __html: section.html }}
                            />
                          ) : (
                            <HtmlEditorPreview
                              initialHtml={section.html}
                              onChange={(newHtml) => updateSection(tabIdx, secIdx, "html", newHtml)}
                              placeholder="Write raw HTML code here... e.g. <h3>Header</h3><p>Text...</p>"
                            />
                          )}
                        </div>
                      </div>
                    ))}

                    {!isImported && (
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
                    )}
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
