"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import Radio from "@/components/form/input/Radio";
import Checkbox from "@/components/form/input/Checkbox";
import TextArea from "@/components/form/input/TextArea";
import DatePicker from "@/components/form/date-picker";
import Star from "@/components/ui/star";
import {
  adminApplicationApi,
  SearchCandidateResult,
  SearchJobResult,
  JobQuestion,
} from "@/services/api/adminApplication";

interface PreSelectedCandidate {
  id: string;
  name: string;
  email?: string;
}

interface PreSelectedJob {
  id: string;
  title: string;
}

interface AdminCreateApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  preSelectedCandidate?: PreSelectedCandidate;
  preSelectedJob?: PreSelectedJob;
}

export default function AdminCreateApplicationModal({
  isOpen,
  onClose,
  onSuccess,
  preSelectedCandidate,
  preSelectedJob,
}: AdminCreateApplicationModalProps) {
  // Selected values
  const [selectedCandidate, setSelectedCandidate] =
    useState<PreSelectedCandidate | null>(null);
  const [selectedJob, setSelectedJob] = useState<PreSelectedJob | null>(null);

  // Search state
  const [candidateSearch, setCandidateSearch] = useState("");
  const [jobSearch, setJobSearch] = useState("");
  const [candidateResults, setCandidateResults] = useState<
    SearchCandidateResult[]
  >([]);
  const [jobResults, setJobResults] = useState<SearchJobResult[]>([]);
  const [isCandidateDropdownOpen, setIsCandidateDropdownOpen] = useState(false);
  const [isJobDropdownOpen, setIsJobDropdownOpen] = useState(false);
  const [isSearchingCandidates, setIsSearchingCandidates] = useState(false);
  const [isSearchingJobs, setIsSearchingJobs] = useState(false);

  // Questions & answers
  const [questions, setQuestions] = useState<JobQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [answerFileMap, setAnswerFileMap] = useState<Record<string, File>>({});
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);

  // Submission
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Refs for debouncing and click-outside
  const candidateDebounceRef = useRef<NodeJS.Timeout | null>(null);
  const jobDebounceRef = useRef<NodeJS.Timeout | null>(null);
  const candidateDropdownRef = useRef<HTMLDivElement>(null);
  const jobDropdownRef = useRef<HTMLDivElement>(null);

  // Initialize pre-selected values when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedCandidate(preSelectedCandidate || null);
      setSelectedJob(preSelectedJob || null);
      setCandidateSearch(preSelectedCandidate?.name || "");
      setJobSearch(preSelectedJob?.title || "");
      setCandidateResults([]);
      setJobResults([]);
      setQuestions([]);
      setAnswers({});
      setAnswerFileMap({});
      setError("");
      setIsCandidateDropdownOpen(false);
      setIsJobDropdownOpen(false);
    }
  }, [isOpen, preSelectedCandidate, preSelectedJob]);

  // Load questions when job is selected
  useEffect(() => {
    if (selectedJob?.id) {
      setIsLoadingQuestions(true);
      adminApplicationApi
        .getJobQuestions(selectedJob.id)
        .then((res) => {
          setQuestions(res.data || []);
          setAnswers({});
          setAnswerFileMap({});
        })
        .catch(() => {
          setQuestions([]);
        })
        .finally(() => setIsLoadingQuestions(false));
    } else {
      setQuestions([]);
      setAnswers({});
    }
  }, [selectedJob?.id]);

  // Click outside handlers
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        candidateDropdownRef.current &&
        !candidateDropdownRef.current.contains(e.target as Node)
      ) {
        setIsCandidateDropdownOpen(false);
      }
      if (
        jobDropdownRef.current &&
        !jobDropdownRef.current.contains(e.target as Node)
      ) {
        setIsJobDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced candidate search
  const handleCandidateSearchChange = useCallback(
    (value: string) => {
      setCandidateSearch(value);
      if (selectedCandidate) {
        setSelectedCandidate(null);
      }
      if (candidateDebounceRef.current)
        clearTimeout(candidateDebounceRef.current);

      if (value.trim().length < 2) {
        setCandidateResults([]);
        setIsCandidateDropdownOpen(false);
        return;
      }

      candidateDebounceRef.current = setTimeout(async () => {
        setIsSearchingCandidates(true);
        try {
          const res = await adminApplicationApi.searchCandidates(value.trim());
          setCandidateResults(res.data || []);
          setIsCandidateDropdownOpen(true);
        } catch {
          setCandidateResults([]);
        } finally {
          setIsSearchingCandidates(false);
        }
      }, 300);
    },
    [selectedCandidate],
  );

  // Debounced job search
  const handleJobSearchChange = useCallback(
    (value: string) => {
      setJobSearch(value);
      if (selectedJob) {
        setSelectedJob(null);
        setQuestions([]);
        setAnswers({});
        setAnswerFileMap({});
      }
      if (jobDebounceRef.current) clearTimeout(jobDebounceRef.current);

      if (value.trim().length < 2) {
        setJobResults([]);
        setIsJobDropdownOpen(false);
        return;
      }

      jobDebounceRef.current = setTimeout(async () => {
        setIsSearchingJobs(true);
        try {
          const res = await adminApplicationApi.searchJobs(value.trim());
          setJobResults(res.data || []);
          setIsJobDropdownOpen(true);
        } catch {
          setJobResults([]);
        } finally {
          setIsSearchingJobs(false);
        }
      }, 300);
    },
    [selectedJob],
  );

  const selectCandidate = (candidate: SearchCandidateResult) => {
    setSelectedCandidate({ id: candidate.id, name: candidate.name, email: candidate.email });
    setCandidateSearch(candidate.name);
    setIsCandidateDropdownOpen(false);
    setCandidateResults([]);
  };

  const selectJob = (job: SearchJobResult) => {
    setSelectedJob({ id: job.id, title: job.title });
    setJobSearch(job.title);
    setIsJobDropdownOpen(false);
    setJobResults([]);
  };

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleCheckboxToggle = (questionId: string, optionText: string) => {
    setAnswers((prev) => {
      const current = prev[questionId] || "";
      const selected = current.split(",").filter(Boolean);
      const updated = selected.includes(optionText)
        ? selected.filter((o) => o !== optionText)
        : [...selected, optionText];
      return { ...prev, [questionId]: updated.join(",") };
    });
  };

  const getInputTypeFromSubTypeValue = (value?: string): string => {
    switch (value) {
      case "Email":
        return "email";
      case "URL":
        return "url";
      case "Phone Number":
        return "tel";
      default:
        return "text";
    }
  };

  const renderQuestionField = (q: JobQuestion) => {
    const typeName = q.questionType?.name;
    const subTypeName = q.questionSubType?.name;

    // Choice — Single Answer → Radio buttons
    if (typeName === "Choice" && subTypeName === "Single Answer") {
      return (
        <div className="flex flex-col gap-2">
          {q.options.map((opt) => (
            <Radio
              key={opt.id}
              id={`q-${q.id}-opt-${opt.id}`}
              name={`question-${q.id}`}
              value={opt.optionText}
              checked={answers[q.id] === opt.optionText}
              label={opt.optionText}
              onChange={(val) => handleAnswerChange(q.id, val)}
            />
          ))}
        </div>
      );
    }

    // Choice — Multiple Answer → Checkboxes
    if (typeName === "Choice" && subTypeName === "Multiple Answer") {
      const selected = (answers[q.id] || "").split(",").filter(Boolean);
      return (
        <div className="flex flex-col gap-2">
          {q.options.map((opt) => (
            <Checkbox
              key={opt.id}
              id={`q-${q.id}-opt-${opt.id}`}
              label={opt.optionText}
              checked={selected.includes(opt.optionText)}
              onChange={() => handleCheckboxToggle(q.id, opt.optionText)}
            />
          ))}
        </div>
      );
    }

    // Text — Long Answer → TextArea
    if (typeName === "Text" && subTypeName === "Long Answer") {
      return (
        <TextArea
          value={answers[q.id] || ""}
          onChange={(val) => handleAnswerChange(q.id, val)}
          rows={4}
          placeholder="Enter your answer..."
        />
      );
    }

    // Text — Short Answer → Input with type based on questionSubTypeValue
    if (typeName === "Text" && subTypeName === "Short Answer") {
      const inputType = getInputTypeFromSubTypeValue(q.questionSubTypeValue?.value);
      return (
        <input
          type={inputType}
          value={answers[q.id] || ""}
          onChange={(e) => handleAnswerChange(q.id, e.target.value)}
          placeholder={
            q.questionSubTypeValue?.value
              ? `Enter ${q.questionSubTypeValue.value.toLowerCase()}...`
              : "Enter your answer..."
          }
          className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg
            bg-white dark:bg-gray-700 text-gray-900 dark:text-white
            placeholder-gray-500 dark:placeholder-gray-400
            focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30"
        />
      );
    }

    // Date — Date Picker
    if (typeName === "Date") {
      const datePickerId = `q-date-${q.id}`;
      return (
        <DatePicker
          id={datePickerId}
          mode="single"
          placeholder="Select a date..."
          defaultDate={answers[q.id] || undefined}
          onChange={(_selectedDates, dateStr) => {
            handleAnswerChange(q.id, dateStr);
          }}
        />
      );
    }

    // Rating — Clickable stars
    if (typeName === "Rating") {
      const currentRating = parseInt(answers[q.id] || "0", 10);
      const maxRating = 5;
      return (
        <div className="flex items-center gap-1">
          {Array.from({ length: maxRating }, (_, i) => i + 1).map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => handleAnswerChange(q.id, String(star))}
              className="p-0.5 transition-transform hover:scale-110 focus:outline-none"
              aria-label={`Rate ${star} out of ${maxRating}`}
            >
              <Star
                width={24}
                height={24}
                fill={star <= currentRating ? "#FFD700" : "transparent"}
                stroke={star <= currentRating ? "#FFD700" : "#9CA3AF"}
                strokeWidth={1.5}
              />
            </button>
          ))}
          {currentRating > 0 && (
            <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
              {currentRating}/{maxRating}
            </span>
          )}
        </div>
      );
    }

    // File — File input
    if (typeName === "File") {
      const selectedFile = answerFileMap[q.id];
      return (
        <div className="flex flex-col gap-1">
          <input
            type="file"
            id={`q-file-${q.id}`}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                setAnswerFileMap((prev) => ({ ...prev, [q.id]: file }));
              } else {
                setAnswerFileMap((prev) => {
                  const next = { ...prev };
                  delete next[q.id];
                  return next;
                });
              }
            }}
            className="block w-full text-sm text-gray-700 dark:text-gray-300
              file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0
              file:text-sm file:font-medium file:bg-primary/10 file:text-primary
              hover:file:bg-primary/20 cursor-pointer
              border border-gray-300 dark:border-gray-600 rounded-lg p-1
              bg-white dark:bg-gray-700"
          />
          {selectedFile && (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Selected: {selectedFile.name}
            </p>
          )}
        </div>
      );
    }

    // Fallback — generic textarea for legacy questions without type info
    return (
      <textarea
        value={answers[q.id] || ""}
        onChange={(e) => handleAnswerChange(q.id, e.target.value)}
        rows={2}
        placeholder="Enter your answer..."
        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg
          bg-white dark:bg-gray-700 text-gray-900 dark:text-white
          placeholder-gray-500 dark:placeholder-gray-400
          focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30"
      />
    );
  };

  const handleSubmit = async () => {
    setError("");

    if (!selectedCandidate) {
      setError("Please select a candidate from the search results.");
      return;
    }
    if (!selectedJob) {
      setError("Please select a job from the search results.");
      return;
    }

    // Check required questions
    const requiredUnanswered = questions.filter((q) => {
      if (!q.required) return false;
      if (q.questionType?.id === 4) return !answerFileMap[q.id];
      return !answers[q.id]?.trim();
    });
    if (requiredUnanswered.length > 0) {
      setError("Please answer all required questions.");
      return;
    }

    const answerPayload = Object.entries(answers)
      .filter(([, text]) => text.trim() !== "")
      .map(([questionId, answerText]) => ({
        questionId,
        answerText: answerText.trim(),
      }));

    // Add placeholder entries for file answers so the backend knows which
    // questions have file uploads (the actual file content comes via FormData).
    const fileQuestionIds = Object.keys(answerFileMap);
    fileQuestionIds.forEach((qId) => {
      if (!answerPayload.find((a) => a.questionId === qId)) {
        answerPayload.push({ questionId: qId, answerText: "" });
      }
    });

    setIsSubmitting(true);
    try {
      let payload: FormData | { candidateId: string; jobId: string; answers?: { questionId: string; answerText: string }[] };

      if (fileQuestionIds.length > 0) {
        const fd = new FormData();
        fd.append("candidateId", selectedCandidate.id);
        fd.append("jobId", selectedJob.id);
        if (answerPayload.length > 0) {
          fd.append("answers", JSON.stringify(answerPayload));
        }
        fileQuestionIds.forEach((qId) => {
          const file = answerFileMap[qId];
          // Name encodes the questionId so the backend can map file → question
          fd.append("answerFiles", file, `${qId}_|_${file.name}`);
        });
        payload = fd;
      } else {
        payload = {
          candidateId: selectedCandidate.id,
          jobId: selectedJob.id,
          answers: answerPayload.length > 0 ? answerPayload : undefined,
        };
      }

      await adminApplicationApi.createApplicationOnBehalf(payload);
      onSuccess();
      onClose();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to create application";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      isFullscreen={false}
      showCloseButton={false}
      className="max-w-2xl mx-auto mt-10 rounded-lg"
    >
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Create Application on Behalf
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-4 overflow-y-auto flex-1 space-y-5">
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-lg">
              {error}
            </div>
          )}

          {/* Candidate Search */}
          <div ref={candidateDropdownRef} className="relative">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Candidate <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={candidateSearch}
                onChange={(e) => handleCandidateSearchChange(e.target.value)}
                onFocus={() => {
                  if (candidateResults.length > 0 && !selectedCandidate)
                    setIsCandidateDropdownOpen(true);
                }}
                placeholder="Search by name, email, or ID..."
                disabled={!!preSelectedCandidate}
                className={`w-full px-3 py-2 text-sm border rounded-lg
                  ${selectedCandidate ? "border-green-300 bg-green-50 dark:bg-green-900/10 dark:border-green-700" : "border-gray-300 dark:border-gray-600"}
                  bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                  placeholder-gray-500 dark:placeholder-gray-400
                  focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30
                  disabled:opacity-60 disabled:cursor-not-allowed`}
              />
              {isSearchingCandidates && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <div className="w-4 h-4 border-2 border-gray-300 border-t-primary rounded-full animate-spin" />
                </div>
              )}
              {selectedCandidate?.email && (
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {selectedCandidate.email}
                </p>
              )}
              {selectedCandidate && !preSelectedCandidate && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCandidate(null);
                    setCandidateSearch("");
                    setCandidateResults([]);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
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
            {isCandidateDropdownOpen && candidateResults.length > 0 && (
              <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                {candidateResults.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => selectCandidate(c)}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <span className="font-medium text-gray-900 dark:text-white">
                      {c.name}
                    </span>
                    {c.email && (
                      <span className="ml-2 text-gray-500 dark:text-gray-400">
                        {c.email}
                      </span>
                    )}
                    {c.occupation && (
                      <span className="block text-xs text-gray-400 dark:text-gray-500">
                        {c.occupation}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Job Search */}
          <div ref={jobDropdownRef} className="relative">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Job <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={jobSearch}
                onChange={(e) => handleJobSearchChange(e.target.value)}
                onFocus={() => {
                  if (jobResults.length > 0 && !selectedJob)
                    setIsJobDropdownOpen(true);
                }}
                placeholder="Search by title or job ID..."
                disabled={!!preSelectedJob}
                className={`w-full px-3 py-2 text-sm border rounded-lg
                  ${selectedJob ? "border-green-300 bg-green-50 dark:bg-green-900/10 dark:border-green-700" : "border-gray-300 dark:border-gray-600"}
                  bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                  placeholder-gray-500 dark:placeholder-gray-400
                  focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30
                  disabled:opacity-60 disabled:cursor-not-allowed`}
              />
              {isSearchingJobs && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <div className="w-4 h-4 border-2 border-gray-300 border-t-primary rounded-full animate-spin" />
                </div>
              )}
              {selectedJob && !preSelectedJob && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedJob(null);
        setJobSearch("");
        setJobResults([]);
        setQuestions([]);
        setAnswers({});
        setAnswerFileMap({});
      }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
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
            {selectedJob && (
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                ID: {selectedJob.id}
              </p>
            )}
            {isJobDropdownOpen && jobResults.length > 0 && (
              <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                {jobResults.map((j) => (
                  <button
                    key={j.id}
                    type="button"
                    onClick={() => selectJob(j)}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <span className="font-medium text-gray-900 dark:text-white">
                      {j.title}
                    </span>
                    {j.companyName && (
                      <span className="ml-2 text-gray-500 dark:text-gray-400">
                        — {j.companyName}
                      </span>
                    )}
                    <span className="block text-xs text-gray-400 dark:text-gray-500">
                      ID: {j.id}{j.location ? ` · ${j.location}` : ""}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Job Questions */}
          {selectedJob && (
            <div className="space-y-4">
              {isLoadingQuestions ? (
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <div className="w-4 h-4 border-2 border-gray-300 border-t-primary rounded-full animate-spin" />
                  Loading questions...
                </div>
              ) : questions.length > 0 ? (
                <>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Job Questions
                  </h4>
                  {questions.map((q) => (
                    <div key={q.id}>
                      <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                        {q.questionText}
                        {q.required && (
                          <span className="text-red-500 ml-1">*</span>
                        )}
                        {q.questionSubType && (
                          <span className="ml-2 text-xs font-normal text-gray-400 dark:text-gray-500">
                            ({q.questionSubType.name})
                          </span>
                        )}
                      </label>
                      {renderQuestionField(q)}
                    </div>
                  ))}
                </>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No questions required for this job.
                </p>
              )}
            </div>
          )}

          {/* Info about default resume */}
          <div className="p-3 text-sm text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400 border border-blue-200 dark:border-blue-800 rounded-lg">
            The candidate&apos;s default resume will be automatically attached
            to this application.
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
          <Button
            variant="ghost"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg"
          >
            Cancel
          </Button>
          <Button
            variant="default"
            onClick={handleSubmit}
            disabled={isSubmitting || !selectedCandidate || !selectedJob}
            className="px-4 py-2 text-sm rounded-lg"
          >
            {isSubmitting ? "Creating..." : "Create Application"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
