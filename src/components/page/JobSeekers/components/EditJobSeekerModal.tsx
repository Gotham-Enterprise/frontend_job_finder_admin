import React, { useState, useEffect, useCallback, memo, useMemo } from "react";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import Input from "@/components/ui/input/Input";
import Select from "@/components/form/Select";
import DatePicker from "@/components/form/date-picker";
import { jobSeekerApi } from "@/services/api/jobSeeker";
import { JobSeekerLicensePayload, JobSeekerUpdateData } from "@/services/types/jobSeeker";
import { useStates } from "@/services/hooks/useStates";
import { useLicenses } from "@/services/hooks/useLicenses";
import { useOccupationsWithSpecialties } from "@/services/hooks/useJobCreation";
import { Trash2 } from "lucide-react";

interface EditJobSeekerModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobSeekerId: string;
  onUpdate: () => void;
}

function newLicenseKey(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `lic-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

type LicenseFormRow = {
  key: string;
  name: string;
  licenseIdNumber: string;
  issuingState: string;
  issueDate: string;
  expirationDate: string;
};

const emptyLicenseRow = (): LicenseFormRow => ({
  key: newLicenseKey(),
  name: "",
  licenseIdNumber: "",
  issuingState: "",
  issueDate: "",
  expirationDate: "",
});

function toDateInputValue(value: string | undefined): string {
  if (!value) return "";
  const s = value.trim();
  if (s.length >= 10 && s[4] === "-" && s[7] === "-") {
    return s.slice(0, 10);
  }
  if (s.includes("T")) {
    return s.split("T")[0]!.slice(0, 10);
  }
  return s.length >= 10 ? s.slice(0, 10) : s;
}

function buildValidLicenses(rows: LicenseFormRow[]): JobSeekerLicensePayload[] {
  return rows
    .map((row) => ({
      name: row.name.trim(),
      licenseIdNumber: row.licenseIdNumber.trim(),
      issuingState: row.issuingState.trim(),
      issueDate: row.issueDate.trim(),
      expirationDate: row.expirationDate.trim(),
    }))
    .filter((r) => r.name && r.issuingState && r.issueDate && r.expirationDate)
    .map((r) => ({
      name: r.name,
      issuingState: r.issuingState,
      issueDate: r.issueDate,
      expirationDate: r.expirationDate,
      ...(r.licenseIdNumber ? { licenseIdNumber: r.licenseIdNumber } : {}),
    }));
}

function validateNoPartialLicenseRows(rows: LicenseFormRow[]): string | null {
  for (const row of rows) {
    const parts = [row.name, row.licenseIdNumber, row.issuingState, row.issueDate, row.expirationDate].map((s) => s.trim());
    const anyFilled = parts.some(Boolean);
    const allRequired = row.name.trim() && row.issuingState.trim() && row.issueDate.trim() && row.expirationDate.trim();
    if (anyFilled && !allRequired) {
      return "Each license must have name, issuing state, issue date, and expiration date, or clear all fields in that row.";
    }
  }
  return null;
}

/** Issue date must not be after expiration (ISO YYYY-MM-DD strings compare lexicographically). */
function validateLicenseIssueNotAfterExpiration(rows: LicenseFormRow[]): string | null {
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]!;
    const issue = row.issueDate.trim();
    const expiration = row.expirationDate.trim();
    if (!issue || !expiration) continue;
    if (issue > expiration) {
      return `License ${i + 1}: Issue date must be on or before the expiration date.`;
    }
  }
  return null;
}

type LicenseSelectOption = { value: string; label: string };

const EditJobSeekerLicenseCard = memo(function EditJobSeekerLicenseCard({
  row,
  updateLicenseRow,
  onRemove,
  licenseNameOptions,
  issuingStateOptions,
  licensesSelectDisabled,
  statesSelectDisabled,
  licenseNumber,
  licenseTotal,
}: {
  row: LicenseFormRow;
  updateLicenseRow: (key: string, field: keyof Omit<LicenseFormRow, "key">, value: string) => void;
  onRemove: (key: string) => void;
  licenseNameOptions: LicenseSelectOption[];
  issuingStateOptions: LicenseSelectOption[];
  licensesSelectDisabled: boolean;
  statesSelectDisabled: boolean;
  licenseNumber: number;
  licenseTotal: number;
}) {
  const onIssueDateChange = useCallback(
    (_selectedDates: Date[], dateStr: string) => {
      updateLicenseRow(row.key, "issueDate", dateStr || "");
    },
    [row.key, updateLicenseRow]
  );

  const onExpirationDateChange = useCallback(
    (_selectedDates: Date[], dateStr: string) => {
      updateLicenseRow(row.key, "expirationDate", dateStr || "");
    },
    [row.key, updateLicenseRow]
  );

  const issueInputId = `js-edit-lic-issue-${row.key}`;
  const expInputId = `js-edit-lic-exp-${row.key}`;

  return (
    <div className="p-3 rounded-md border border-gray-200 dark:border-gray-600 bg-gray-50/50 dark:bg-gray-800/40 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
          License {licenseNumber} of {licenseTotal}
        </p>
        <button
          type="button"
          onClick={() => onRemove(row.key)}
          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md p-1.5 text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-950/40"
          aria-label={`Remove license ${licenseNumber} of ${licenseTotal}`}
        >
          <Trash2 className="h-3.5 w-3.5 shrink-0" strokeWidth={2} aria-hidden />
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">License name</label>
          <Select
            options={licenseNameOptions}
            value={row.name}
            onChange={(v) => updateLicenseRow(row.key, "name", v)}
            placeholder="Select license"
            disabled={licensesSelectDisabled}
            searchable={true}
            searchPlaceholder="Search licenses..."
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">License / ID number</label>
          <Input
            type="text"
            value={row.licenseIdNumber}
            onChange={(e) => updateLicenseRow(row.key, "licenseIdNumber", e.target.value)}
            placeholder="Optional"
          />
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Issuing state</label>
        <Select
          options={issuingStateOptions}
          value={row.issuingState}
          onChange={(v) => updateLicenseRow(row.key, "issuingState", v)}
          placeholder="Select state"
          disabled={statesSelectDisabled}
          searchable={true}
          searchPlaceholder="Search states..."
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Issue date</label>
          <DatePicker
            id={issueInputId}
            placeholder="Select issue date"
            defaultDate={row.issueDate || undefined}
            onChange={onIssueDateChange}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Expiration date</label>
          <DatePicker
            id={expInputId}
            placeholder="Select expiration date"
            defaultDate={row.expirationDate || undefined}
            onChange={onExpirationDateChange}
          />
        </div>
      </div>
    </div>
  );
});

export const EditJobSeekerModal: React.FC<EditJobSeekerModalProps> = ({ isOpen, onClose, jobSeekerId, onUpdate }) => {
  const handleClose = () => {
    // Clean up file states when closing
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    setCurrentProfilePicture(null);
    setError(null);

    // Reset form data to prevent state persistence issues
    setFormData({
      firstName: "",
      lastName: "",
      address: "",
      city: "",
      state: "",
      country: "US",
      zipCode: "",
      phoneNumber: "",
      occupationId: 0,
      specialtyId: undefined,
    });
    setLicenseRows([]);

    onClose();
  };

  const [formData, setFormData] = useState<JobSeekerUpdateData>({
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    state: "",
    country: "US",
    zipCode: "",
    phoneNumber: "",
    occupationId: 0,
    specialtyId: undefined,
  });
  const [licenseRows, setLicenseRows] = useState<LicenseFormRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Profile picture states
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [currentProfilePicture, setCurrentProfilePicture] = useState<{
    fileName: string;
    url: string;
    expiresAt: string;
  } | null>(null);

  const { data: statesData, isLoading: isStatesLoading } = useStates();
  const { data: licensesCategoryData, isLoading: isLicensesCategoryLoading } = useLicenses("", 1, 1000);
  const { data: occupationsData, isLoading: isOccupationsLoading } = useOccupationsWithSpecialties();

  const stateOptions = useMemo((): LicenseSelectOption[] => {
    if (statesData?.success && statesData.data) {
      return statesData.data.states.map((state) => ({
        value: state.abbreviation,
        label: state.name,
      }));
    }
    return [];
  }, [statesData]);

  const licenseNameOptions = useMemo((): LicenseSelectOption[] => {
    const fromApi: LicenseSelectOption[] = [];
    if (licensesCategoryData?.success && licensesCategoryData.data?.length) {
      for (const l of licensesCategoryData.data) {
        fromApi.push({ value: l.name, label: l.name });
      }
    }
    const seen = new Set(fromApi.map((o) => o.value));
    const legacy: LicenseSelectOption[] = [];
    for (const r of licenseRows) {
      const n = r.name?.trim();
      if (n && !seen.has(n)) {
        seen.add(n);
        legacy.push({ value: n, label: n });
      }
    }
    return [{ value: "", label: "Select license" }, ...fromApi, ...legacy];
  }, [licensesCategoryData, licenseRows]);

  const issuingStateOptions = useMemo((): LicenseSelectOption[] => {
    const seen = new Set(stateOptions.map((o) => o.value));
    const legacy: LicenseSelectOption[] = [];
    for (const r of licenseRows) {
      const v = r.issuingState?.trim();
      if (v && !seen.has(v)) {
        seen.add(v);
        legacy.push({ value: v, label: v });
      }
    }
    return [...stateOptions, ...legacy];
  }, [stateOptions, licenseRows]);

  const countryOptions = [
    { value: "US", label: "United States" },
    { value: "CA", label: "Canada" },
    { value: "MX", label: "Mexico" },
  ];

  const occupationOptions = [
    { value: "", label: "Select occupation" },
    ...(occupationsData?.success && occupationsData.data
      ? occupationsData.data.map((occupation) => ({
          value: occupation.id.toString(),
          label: occupation.name,
        }))
      : []),
  ];

  // Get specialties for selected occupation
  const getSpecialtyOptions = () => {
    if (!formData.occupationId || !occupationsData?.success || !occupationsData.data) {
      return [{ value: "", label: "Select occupation first" }];
    }

    const selectedOccupation = occupationsData.data.find(
      (occ) => occ.id === parseInt(formData.occupationId.toString())
    );

    if (!selectedOccupation || !selectedOccupation.specialty) {
      return [{ value: "", label: "No specialties available" }];
    }

    return [
      { value: "", label: "Select specialty (optional)" },
      ...selectedOccupation.specialty.map((specialty) => ({
        value: specialty.id.toString(),
        label: specialty.name,
      })),
    ];
  };

  // Profile picture handling functions
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        setError("Please select a valid image file");
        return;
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        setError("File size must be less than 5MB");
        return;
      }

      setSelectedFile(file);

      // Create preview URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setError(null);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    // Note: We keep currentProfilePicture to show existing image unless user uploads new one
    // If user wants to remove existing profile picture, they need to save with no new file selected
  };

  // Clean up preview URL on unmount
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const loadJobSeekerData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await jobSeekerApi.getJobSeekerById(jobSeekerId);
      if (response.success && response.data) {
        const jobSeeker = response.data;
        // Split name into first and last name
        const nameParts = jobSeeker.name?.split(" ") || ["", ""];
        const firstName = jobSeeker.firstName?.trim() || nameParts[0] || "";
        const lastName = jobSeeker.lastName?.trim() || nameParts.slice(1).join(" ") || "";

        setFormData({
          firstName,
          lastName,
          address: jobSeeker.address || "",
          city: jobSeeker.city || "",
          state: jobSeeker.state || "",
          country: "US", // Default to US
          zipCode: jobSeeker.zipCode || "",
          phoneNumber: jobSeeker.phoneNumber || "",
          occupationId: jobSeeker.occupationId || 0,
          specialtyId: jobSeeker.specialtyId || undefined,
        });

        if (jobSeeker.licenses && jobSeeker.licenses.length > 0) {
          setLicenseRows(
            jobSeeker.licenses.map((lic) => ({
              key: lic.id || newLicenseKey(),
              name: lic.name || "",
              licenseIdNumber: lic.licenseIdNumber || "",
              issuingState: lic.issuingState || "",
              issueDate: toDateInputValue(lic.issueDate),
              expirationDate: toDateInputValue(lic.expirationDate),
            }))
          );
        } else {
          setLicenseRows([]);
        }

        // Set current profile picture if exists
        if (jobSeeker.profilePicture?.url) {
          setCurrentProfilePicture({
            fileName: "Current Profile Picture",
            url: jobSeeker.profilePicture.url,
            expiresAt: jobSeeker.profilePicture.expiresAt || "",
          });
        } else {
          setCurrentProfilePicture(null);
        }
      }
    } catch (err) {
      setError("Failed to load job seeker data");
      console.error("Error loading job seeker:", err);
    } finally {
      setIsLoading(false);
    }
  }, [jobSeekerId]);

  useEffect(() => {
    if (isOpen && jobSeekerId) {
      setError(null); // Clear any previous errors
      loadJobSeekerData();
    }
  }, [isOpen, jobSeekerId, loadJobSeekerData]);

  // Separate effect to ensure state dropdown works correctly when states data loads
  useEffect(() => {
    if (statesData?.success && formData.state && stateOptions.length > 0) {
      // Debug logging for state matching
      if (process.env.NODE_ENV === "development") {
        console.log("State Matching Debug:", {
          formDataState: formData.state,
          availableOptions: stateOptions.map((opt) => ({ value: opt.value, label: opt.label })),
        });
      }

      // Check if current state value exists in options, if not try to find a match
      const currentStateExists = stateOptions.find((option) => option.value === formData.state);
      if (!currentStateExists && formData.state) {
        // Try to find state by name or partial match
        const stateByName = stateOptions.find(
          (option) =>
            option.label.toLowerCase() === formData.state.toLowerCase() ||
            option.label.toLowerCase().includes(formData.state.toLowerCase())
        );
        if (stateByName) {
          if (process.env.NODE_ENV === "development") {
            console.log("State Match Found:", {
              original: formData.state,
              matched: stateByName.value,
              matchedLabel: stateByName.label,
            });
          }
          setFormData((prev) => ({ ...prev, state: stateByName.value }));
        } else if (process.env.NODE_ENV === "development") {
          console.warn("No state match found for:", formData.state);
        }
      }
    }
  }, [statesData, formData.state, stateOptions]);

  // Map stored issuing state (e.g. full name) to US state abbreviation to match us_states / Select values
  useEffect(() => {
    if (!statesData?.success || !statesData.data?.states.length) return;
    const states = statesData.data.states;
    setLicenseRows((prev) => {
      if (!prev.length) return prev;
      return prev.map((row) => {
        if (!row.issuingState?.trim()) return row;
        const t = row.issuingState.trim();
        if (states.some((s) => s.abbreviation === t)) return row;
        const byName = states.find((s) => s.name.toLowerCase() === t.toLowerCase());
        if (byName) return { ...row, issuingState: byName.abbreviation };
        return row;
      });
    });
  }, [statesData]);

  const updateLicenseRow = useCallback((key: string, field: keyof Omit<LicenseFormRow, "key">, value: string) => {
    setLicenseRows((prev) => prev.map((r) => (r.key === key ? { ...r, [field]: value } : r)));
  }, []);

  const addLicenseRow = useCallback(() => {
    setLicenseRows((prev) => [...prev, emptyLicenseRow()]);
  }, []);

  const removeLicenseRow = useCallback((key: string) => {
    setLicenseRows((prev) => prev.filter((r) => r.key !== key));
  }, []);

  const updateField = (field: keyof JobSeekerUpdateData, value: string | number | undefined) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error when user starts typing in required fields
    if (
      (field === "firstName" || field === "lastName") &&
      value &&
      typeof value === "string" &&
      value.trim() &&
      error
    ) {
      setError(null);
    }

    // Reset specialty when occupation changes
    if (field === "occupationId") {
      setFormData((prev) => ({
        ...prev,
        occupationId: value as number,
        specialtyId: undefined,
      }));
    }
  };

  const saveChanges = async () => {
    setIsSaving(true);
    setError(null);

    // Frontend validation
    if (!formData.firstName.trim()) {
      setError("First name is required");
      setIsSaving(false);
      return;
    }

    if (!formData.lastName.trim()) {
      setError("Last name is required");
      setIsSaving(false);
      return;
    }

    if (!formData.occupationId || formData.occupationId === 0) {
      setError("Occupation is required");
      setIsSaving(false);
      return;
    }

    const licenseError = validateNoPartialLicenseRows(licenseRows);
    if (licenseError) {
      setError(licenseError);
      setIsSaving(false);
      return;
    }

    const licenseDateOrderError = validateLicenseIssueNotAfterExpiration(licenseRows);
    if (licenseDateOrderError) {
      setError(licenseDateOrderError);
      setIsSaving(false);
      return;
    }

    try {
      // Create form data with file if selected
      const updateData: JobSeekerUpdateData = { ...formData };
      if (selectedFile) {
        updateData.uploadProfilePicture = selectedFile;
      }
      const validLicenses = buildValidLicenses(licenseRows);
      if (validLicenses.length > 0) {
        updateData.licenses = validLicenses;
      }

      await jobSeekerApi.updateJobSeeker(jobSeekerId, updateData);
      onUpdate();
      handleClose();
    } catch (err) {
      const errorMessage =
        typeof err === "object" && err !== null && "message" in err ? (err as { message?: string }).message : undefined;
      setError(errorMessage || "Failed to update job seeker");
      console.error("Error updating job seeker:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const isFormValid = () => {
    return (
      formData.firstName.trim() && formData.lastName.trim() && formData.occupationId && formData.occupationId !== 0
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      isFullscreen={false}
      className="max-w-2xl mx-auto mt-8 mb-8 rounded-lg shadow-xl max-h-[90vh] overflow-y"
    >
      <div className="flex flex-col max-h-[90vh]">
        <div className="p-6 pb-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Edit Job Seeker</h2>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brand-500"></div>
              <span className="ml-2 text-gray-600 dark:text-gray-400">Loading...</span>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Profile Picture Upload Section - Left aligned with upload text on right */}
              <div className="flex items-center space-x-6 mb-6">
                {/* Profile Picture Circle - Left Side */}
                <div className="relative flex-shrink-0">
                  <div className="w-32 h-32 rounded-full border-4 border-gray-200 dark:border-gray-600 overflow-hidden bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                    {previewUrl ? (
                      <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                    ) : currentProfilePicture?.url ? (
                      <img
                        src={currentProfilePicture.url}
                        alt="Current profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                    )}
                  </div>

                  {/* Camera Icon Button */}
                  <label
                    htmlFor="jobseeker-profile-picture-upload"
                    className="absolute bottom-2 right-2 w-10 h-10 bg-brand-500 hover:bg-brand-600 rounded-full flex items-center justify-center cursor-pointer shadow-lg transition-colors"
                  >
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  </label>

                  {/* Remove Button - only show when image exists */}
                  {(selectedFile || currentProfilePicture) && (
                    <button
                      type="button"
                      onClick={handleRemoveFile}
                      className="absolute top-2 right-2 w-8 h-8 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center cursor-pointer shadow-lg transition-colors"
                    >
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>

                {/* Upload Instructions - Right Side */}
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Upload Profile Picture</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                    Click the camera icon to select a profile picture. PNG, JPG up to 5MB.
                  </p>
                  {selectedFile && (
                    <div className="text-sm text-green-600 dark:text-green-400">✓ New image selected</div>
                  )}
                </div>

                {/* Hidden file input */}
                <input
                  id="jobseeker-profile-picture-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    First Name *
                  </label>
                  <Input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => updateField("firstName", e.target.value)}
                    placeholder="Enter first name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Last Name *</label>
                  <Input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => updateField("lastName", e.target.value)}
                    placeholder="Enter last name"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Address</label>
                <Input
                  type="text"
                  value={formData.address}
                  onChange={(e) => updateField("address", e.target.value)}
                  placeholder="Enter address"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">City</label>
                  <Input
                    type="text"
                    value={formData.city}
                    onChange={(e) => updateField("city", e.target.value)}
                    placeholder="Enter city"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">State</label>
                  <Select
                    options={stateOptions}
                    value={formData.state || ""}
                    onChange={(value: string) => updateField("state", value)}
                    placeholder="Select state"
                    disabled={isStatesLoading}
                    searchable={true}
                    searchPlaceholder="Search states..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Country</label>
                  <Select
                    options={countryOptions}
                    value={formData.country}
                    defaultValue="US"
                    onChange={(value: string) => updateField("country", value)}
                    placeholder="United States"
                    disabled={true}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Zip Code</label>
                  <Input
                    type="text"
                    value={formData.zipCode}
                    onChange={(e) => updateField("zipCode", e.target.value)}
                    placeholder="Enter zip code"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone Number</label>
                <Input
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={(e) => updateField("phoneNumber", e.target.value)}
                  placeholder="Enter phone number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Occupation *</label>
                <Select
                  options={occupationOptions}
                  value={formData.occupationId.toString()}
                  onChange={(value: string) => updateField("occupationId", parseInt(value) || 0)}
                  placeholder="Select occupation"
                  disabled={isOccupationsLoading}
                  searchable={true}
                  searchPlaceholder="Search occupations..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Specialty</label>
                <Select
                  options={getSpecialtyOptions()}
                  value={formData.specialtyId?.toString() || ""}
                  onChange={(value: string) => updateField("specialtyId", value ? parseInt(value) : undefined)}
                  placeholder="Select specialty (optional)"
                  disabled={!formData.occupationId || formData.occupationId === 0}
                  searchable={true}
                  searchPlaceholder="Search specialties..."
                />
              </div>

              <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">Licenses</h3>
                  <button
                    type="button"
                    onClick={addLicenseRow}
                    className="inline-flex items-center justify-center h-9 rounded-sm border border-gray-300 dark:border-gray-600 bg-transparent px-3 text-xs font-medium text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Add license
                  </button>
                </div>
                {licenseRows.length === 0 ? (
                  <p className="text-sm text-gray-500 dark:text-gray-400">No licenses added. Use &quot;Add license&quot; to include one.</p>
                ) : (
                  <div className="space-y-4">
                    {licenseRows.map((row, index) => (
                      <EditJobSeekerLicenseCard
                        key={row.key}
                        row={row}
                        updateLicenseRow={updateLicenseRow}
                        onRemove={removeLicenseRow}
                        licenseNameOptions={licenseNameOptions}
                        issuingStateOptions={issuingStateOptions}
                        licensesSelectDisabled={isLicensesCategoryLoading}
                        statesSelectDisabled={isStatesLoading}
                        licenseNumber={index + 1}
                        licenseTotal={licenseRows.length}
                      />
                    ))}
                  </div>
                )}
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                  Saving with at least one complete license replaces all existing licenses for this job seeker. Clear all
                  license rows to leave current licenses unchanged.
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="shrink-0 border-t border-gray-200 dark:border-gray-700 p-6 pt-4 space-y-3">
          {error && (
            <div
              className="p-3 bg-red-50 border border-red-200 rounded-md dark:bg-red-950/30 dark:border-red-800"
              role="alert"
            >
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={handleClose} disabled={isSaving}>
              Cancel
            </Button>
            <Button variant="default" onClick={saveChanges} disabled={!isFormValid() || isSaving || isLoading}>
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
