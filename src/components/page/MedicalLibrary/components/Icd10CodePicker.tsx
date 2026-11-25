"use client";

import React, { useEffect, useRef, useState } from "react";
import { medicalLibraryApi, Icd10SearchHit } from "@/services/api/medicalLibrary";

interface Icd10CodePickerProps {
  onPick: (hit: Icd10SearchHit) => void;
  /** Codes already in the list; shown disabled in the dropdown */
  excludeCodes?: string[];
  autoFocus?: boolean;
  placeholder?: string;
}

/**
 * Searchable ICD-10-CM picker. Type a code prefix ("F41") or a condition
 * name ("anxiety"); options show the code, the official name and, when the
 * NLM conditions list knows one, the lay name. Picking fills the row, so
 * codes and names always come from the official list rather than being typed.
 */
const Icd10CodePicker: React.FC<Icd10CodePickerProps> = ({
  onPick,
  excludeCodes = [],
  autoFocus = false,
  placeholder = "Type a code (F41) or a condition name (anxiety)…",
}) => {
  const [query, setQuery] = useState("");
  const [hits, setHits] = useState<Icd10SearchHit[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setHits([]);
      return;
    }
    let cancelled = false;
    setLoading(true);
    const id = setTimeout(async () => {
      try {
        const res = await medicalLibraryApi.searchIcd10Codes(q);
        if (!cancelled) {
          setHits(res?.data || []);
          setActiveIndex(0);
          setOpen(true);
        }
      } catch {
        if (!cancelled) setHits([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(id);
    };
  }, [query]);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const excluded = new Set(excludeCodes.map((c) => c.toUpperCase()));

  const pick = (hit: Icd10SearchHit) => {
    if (excluded.has(hit.code.toUpperCase())) return;
    onPick(hit);
    setQuery("");
    setHits([]);
    setOpen(false);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open || hits.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, hits.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      pick(hits[activeIndex]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <input
        type="text"
        value={query}
        autoFocus={autoFocus}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => hits.length > 0 && setOpen(true)}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={open}
        aria-controls="icd10-code-options"
      />
      {loading && <span className="absolute right-3 top-2.5 text-xs text-gray-400">Searching…</span>}
      {open && query.trim().length >= 2 && (
        <ul
          id="icd10-code-options"
          role="listbox"
          className="absolute z-20 mt-1 max-h-72 w-full overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800"
        >
          {hits.length === 0 && !loading && (
            <li className="px-3 py-2 text-xs text-gray-500 dark:text-gray-400">No ICD-10-CM code matches &quot;{query.trim()}&quot;.</li>
          )}
          {hits.map((hit, i) => {
            const taken = excluded.has(hit.code.toUpperCase());
            return (
              <li key={hit.code}>
                <button
                  type="button"
                  disabled={taken}
                  onMouseEnter={() => setActiveIndex(i)}
                  onClick={() => pick(hit)}
                  className={`flex w-full items-start gap-3 px-3 py-2 text-left text-sm ${
                    taken ? "cursor-not-allowed opacity-50" : i === activeIndex ? "bg-blue-50 dark:bg-blue-900/20" : "hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  }`}
                >
                  <code className="shrink-0 font-mono font-semibold text-gray-900 dark:text-white w-20">{hit.code}</code>
                  <span className="min-w-0">
                    <span className="block text-gray-800 dark:text-gray-200">{hit.name}</span>
                    {hit.layNames.length > 0 && (
                      <span className="block text-xs text-teal-700 dark:text-teal-400">Also known as: {hit.layNames.join(", ")}</span>
                    )}
                    {taken && <span className="block text-xs text-gray-400">already added</span>}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default Icd10CodePicker;
