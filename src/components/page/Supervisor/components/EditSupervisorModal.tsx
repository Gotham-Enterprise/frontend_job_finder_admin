"use client";

import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Paperclip, X as XIcon } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import Input from "@/components/ui/input/Input";
import Select from "@/components/form/Select";
import MultiSelect from "@/components/form/MultiSelect";
import DatePicker from "@/components/form/date-picker";
import USPhoneInput from "@/components/ui/USPhoneInput";
import { FormField } from "@/components/ui/form";
import Alert from "@/components/ui/alert/Alert";
import ProfilePhotoUpload from "@/components/ui/ProfilePhotoUpload";
import TextArea from "@/components/form/input/TextArea";
import { supervisorApi } from "@/services/api/supervisor";
import { useCitiesByState } from "@/lib/useStatesCities";
import {
  formDataToUpdatePayload,
  mapSupervisorDetailsToFormData,
  validateSupervisorEditForm,
  type SupervisorEditFormData,
  type SupervisorFieldErrors,
} from "@/services/utils/supervisorProfileForm";
import {
  useUpdateSupervisor,
  useSupervisorEditFormOptions,
} from "@/services/hooks/useSupervisors";
import { useSupervisorTypesData } from "@/services/hooks/useSupervisees";
import { useStates } from "@/services/hooks/useStates";
import {
  SUPERVISOR_PROFILE_TEXT_MAX_LENGTH,
  supervisorYearsOfExperienceSelectOptions,
} from "@/constants/supervisorSignupOptions";

interface EditSupervisorModalProps {
  isOpen: boolean;
  onClose: () => void;
  supervisorId: string;
  supervisorName?: string;
  onUpdate: () => void;
}

const emptyForm = (): SupervisorEditFormData => ({
  fullName: "",
  contactNumber: "",
  city: "",
  state: "",
  zipcode: "",
  supervisorType: "",
  occupation: "",
  specialty: "",
  licenseType: "",
  licenseNumber: "",
  licenseExpiration: "",
  yearsOfExperience: "",
  stateOfLicensure: [],
  patientPopulation: [],
  certification: [],
  supervisionFormat: "",
  availability: "",
  professionalSummary: "",
  describeYourself: "",
  acceptingSupervisees: false,
  supervisionFeeType: "",
  supervisionFeeAmount: "",
});

type SelectChoice = { label: string; value: string };

function choicesOnly(items: SelectChoice[]): SelectChoice[] {
  return items.filter((o) => o.value !== "");
}

export const EditSupervisorModal: React.FC<EditSupervisorModalProps> = ({
  isOpen,
  onClose,
  supervisorId,
  supervisorName,
  onUpdate,
}) => {
  const [formData, setFormData] = useState<SupervisorEditFormData>(emptyForm);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<SupervisorFieldErrors>({});

  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [currentPhotoUrl, setCurrentPhotoUrl] = useState<string | null>(null);

  const [selectedLicense, setSelectedLicense] = useState<File | null>(null);
  const [currentLicenseFileName, setCurrentLicenseFileName] = useState<string | null>(null);
  const licenseInputRef = useRef<HTMLInputElement>(null);

  const { mutate: updateMutate, isPending: isSaving } = useUpdateSupervisor();
  const {
    certificateOptions,
    formatOptions,
    availabilityOptions,
    patientPopulationOptions,
    feeTypeOptions,
    isLoading: optionsLoading,
  } = useSupervisorEditFormOptions();
  const { data: supervisorTypesData = [], isLoading: supervisorTypesLoading } =
    useSupervisorTypesData();
  const { data: statesData, isLoading: statesLoading } = useStates();
  const stateAbbr = formData.state?.trim() || null;
  const { data: cities = [], isLoading: citiesLoading } = useCitiesByState(stateAbbr);

  const stateOptions = useMemo(
    () =>
      statesData?.success && statesData.data
        ? statesData.data.states.map((s) => ({ value: s.abbreviation, label: s.name }))
        : [],
    [statesData],
  );

  const stateMultiOptions = useMemo(
    () => stateOptions.map((s) => ({ value: s.value, text: s.label, selected: false })),
    [stateOptions],
  );

  const cityChoices = useMemo(() => {
    const fromApi = cities.map((name) => ({ value: name, label: name }));
    if (formData.city && !fromApi.some((o) => o.value === formData.city)) {
      return choicesOnly([{ value: formData.city, label: formData.city }, ...fromApi]);
    }
    return choicesOnly(fromApi);
  }, [cities, formData.city]);

  const cityPlaceholder = useMemo(() => {
    if (!formData.state) return "Select a state first";
    if (citiesLoading) return "Loading…";
    if (cityChoices.length === 0) return "No cities available";
    return "Select city";
  }, [formData.state, citiesLoading, cityChoices.length]);

  const supervisorTypeChoices = useMemo(
    () => choicesOnly(supervisorTypesData.map((t) => ({ label: t.name, value: t.name }))),
    [supervisorTypesData],
  );

  const selectedType = useMemo(
    () => supervisorTypesData.find((t) => t.name === formData.supervisorType),
    [formData.supervisorType, supervisorTypesData],
  );

  const occupationChoices = useMemo(
    () =>
      choicesOnly(selectedType?.occupations.map((o) => ({ label: o.name, value: o.name })) ?? []),
    [selectedType],
  );

  const occupationPlaceholder = useMemo(() => {
    if (!formData.supervisorType) return "Select a supervisor type first";
    if (occupationChoices.length === 0) return "No occupations available";
    return "Select occupation";
  }, [formData.supervisorType, occupationChoices.length]);

  const selectedOccupation = useMemo(
    () => selectedType?.occupations.find((o) => o.name === formData.occupation),
    [selectedType, formData.occupation],
  );

  const specialtyChoices = useMemo(
    () =>
      choicesOnly(
        selectedOccupation?.specialties.map((s) => ({ label: s.name, value: s.name })) ?? [],
      ),
    [selectedOccupation],
  );

  const specialtyPlaceholder = useMemo(() => {
    if (!formData.occupation) return "Select an occupation first";
    if (specialtyChoices.length === 0) return "No specialties available";
    return "Select specialty (optional)";
  }, [formData.occupation, specialtyChoices.length]);

  const licenseTypeChoices = useMemo(
    () =>
      choicesOnly(
        selectedOccupation?.licenseTypes.map((l) => ({ label: l.name, value: l.name })) ?? [],
      ),
    [selectedOccupation],
  );

  const licenseTypePlaceholder = useMemo(() => {
    if (!formData.occupation) return "Select an occupation first";
    if (licenseTypeChoices.length === 0) return "No license types available";
    return "Select license type";
  }, [formData.occupation, licenseTypeChoices.length]);

  const certMultiOptions = useMemo(
    () =>
      certificateOptions.map((o) => ({ value: o.value, text: o.label, selected: false })),
    [certificateOptions],
  );

  const patientPopMultiOptions = useMemo(
    () =>
      patientPopulationOptions.map((o) => ({ value: o.value, text: o.label, selected: false })),
    [patientPopulationOptions],
  );

  const handleClose = () => {
    setSelectedPhoto(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setCurrentPhotoUrl(null);
    setSelectedLicense(null);
    setCurrentLicenseFileName(null);
    setLoadError(null);
    setFieldErrors({});
    setFormData(emptyForm());
    onClose();
  };

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const response = await supervisorApi.getSupervisorById(supervisorId);
      if (response.success && response.data) {
        const statesList = statesData?.success ? statesData.data.states : [];
        setFormData(mapSupervisorDetailsToFormData(response.data, statesList));
        setCurrentPhotoUrl(response.data.profilePhotoUrl);
        setCurrentLicenseFileName(
          response.data.supervisorProfile?.licenseFileName ?? null,
        );
      }
    } catch {
      setLoadError("Failed to load supervisor data");
    } finally {
      setIsLoading(false);
    }
  }, [supervisorId, statesData]);

  useEffect(() => {
    if (isOpen && supervisorId) loadData();
  }, [isOpen, supervisorId, loadData]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const updateField = <K extends keyof SupervisorEditFormData>(
    field: K,
    value: SupervisorEditFormData[K],
  ) => {
    setFormData((prev) => {
      const next = { ...prev, [field]: value };
      if (field === "supervisorType") {
        next.occupation = "";
        next.specialty = "";
        next.licenseType = "";
      }
      if (field === "occupation") {
        next.specialty = "";
        next.licenseType = "";
      }
      if (field === "state") next.city = "";
      return next;
    });
    setFieldErrors((prev) => {
      if (!prev[field as keyof SupervisorFieldErrors]) return prev;
      const { [field as keyof SupervisorFieldErrors]: _, ...rest } = prev;
      return rest as SupervisorFieldErrors;
    });
  };

  const handlePhotoSelect = (file: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setFieldErrors((prev) => ({
        ...prev,
        uploadProfilePhoto: "Please select a valid image file",
      }));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setFieldErrors((prev) => ({
        ...prev,
        uploadProfilePhoto: "File size must be less than 5MB",
      }));
      return;
    }
    setSelectedPhoto(file);
    setPreviewUrl(URL.createObjectURL(file));
    setFieldErrors((prev) => {
      const { uploadProfilePhoto: _, ...rest } = prev;
      return rest;
    });
  };

  const handleLicenseSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const allowed = ["jpeg", "jpg", "png", "pdf", "doc", "docx"];
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
    if (!allowed.includes(ext)) {
      setFieldErrors((prev) => ({
        ...prev,
        uploadLicense: "Allowed types: JPEG, PNG, PDF, DOC, DOCX",
      }));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setFieldErrors((prev) => ({
        ...prev,
        uploadLicense: "File size must be less than 5MB",
      }));
      return;
    }
    setSelectedLicense(file);
    setFieldErrors((prev) => {
      const { uploadLicense: _, ...rest } = prev;
      return rest;
    });
  };

  const saveChanges = () => {
    const errors = validateSupervisorEditForm(formData);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});

    const payload = formDataToUpdatePayload(
      formData,
      selectedPhoto ?? undefined,
      selectedLicense ?? undefined,
    );
    updateMutate(
      { id: supervisorId, payload },
      {
        onSuccess: () => {
          onUpdate();
          handleClose();
        },
      },
    );
  };

  const optionsStillLoading = optionsLoading || supervisorTypesLoading;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      isFullscreen={false}
      className="max-w-3xl w-full rounded-lg shadow-xl max-h-[90vh] overflow-hidden"
    >
      <div className="flex flex-col max-h-[90vh]">
        <div className="p-6 pb-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Edit Supervisor</h2>
          {supervisorName && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{supervisorName}</p>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {loadError && (
            <div className="mb-4">
              <Alert variant="error" title="Unable to load supervisor" message={loadError} />
            </div>
          )}

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brand-500" />
              <span className="ml-2 text-gray-600 dark:text-gray-400">Loading...</span>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Profile photo */}
              <FormField label="Profile Photo" error={fieldErrors.uploadProfilePhoto}>
                <ProfilePhotoUpload
                  displayUrl={previewUrl || currentPhotoUrl}
                  displayName={formData.fullName || supervisorName || "Supervisor"}
                  hasPendingUpload={Boolean(selectedPhoto)}
                  onFileSelect={handlePhotoSelect}
                  disabled={isSaving}
                />
              </FormField>

              {/* Personal information */}
              <section className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Personal information
                </h3>
                <div className="grid grid-cols-1 gap-4">
                  <FormField label="Full Name" required error={fieldErrors.fullName}>
                    <Input
                      value={formData.fullName}
                      onChange={(e) => updateField("fullName", e.target.value)}
                      placeholder="Enter full name"
                      error={!!fieldErrors.fullName}
                    />
                  </FormField>
                  <FormField label="Contact Number" required error={fieldErrors.contactNumber}>
                    <USPhoneInput
                      value={formData.contactNumber}
                      onChange={(v) => updateField("contactNumber", v)}
                      disabled={isSaving}
                      error={!!fieldErrors.contactNumber}
                    />
                  </FormField>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_1fr_120px]">
                  <FormField
                    key={formData.state || "no-state"}
                    label="City"
                    required
                    error={fieldErrors.city}
                  >
                    <Select
                      value={formData.city}
                      onChange={(v) => updateField("city", v)}
                      options={cityChoices}
                      placeholder={cityPlaceholder}
                      disabled={!formData.state || citiesLoading}
                    />
                  </FormField>
                  <FormField label="State" required error={fieldErrors.state}>
                    <Select
                      value={formData.state}
                      onChange={(v) => updateField("state", v)}
                      options={choicesOnly(stateOptions)}
                      placeholder={statesLoading ? "Loading…" : "Select state"}
                      disabled={statesLoading}
                    />
                  </FormField>
                  <FormField label="Zip Code" required error={fieldErrors.zipcode}>
                    <Input
                      value={formData.zipcode}
                      onChange={(e) => updateField("zipcode", e.target.value)}
                      placeholder="ZIP"
                      error={!!fieldErrors.zipcode}
                    />
                  </FormField>
                </div>
              </section>

              {/* Professional & licensure */}
              <section className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Professional & licensure
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    className="sm:col-span-2"
                    label="Supervisor Type"
                    required
                    error={fieldErrors.supervisorType}
                  >
                    <Select
                      value={formData.supervisorType}
                      onChange={(v) => updateField("supervisorType", v)}
                      options={supervisorTypeChoices}
                      placeholder={supervisorTypesLoading ? "Loading…" : "Select supervisor type"}
                    />
                  </FormField>
                  <FormField label="Occupation" required error={fieldErrors.occupation}>
                    <Select
                      value={formData.occupation}
                      onChange={(v) => updateField("occupation", v)}
                      options={occupationChoices}
                      placeholder={occupationPlaceholder}
                      disabled={!formData.supervisorType}
                    />
                  </FormField>
                  <FormField label="Specialty">
                    <Select
                      value={formData.specialty}
                      onChange={(v) => updateField("specialty", v)}
                      options={specialtyChoices}
                      placeholder={specialtyPlaceholder}
                      disabled={!formData.occupation}
                    />
                  </FormField>
                  <FormField label="License Type" required error={fieldErrors.licenseType}>
                    <Select
                      value={formData.licenseType}
                      onChange={(v) => updateField("licenseType", v)}
                      options={licenseTypeChoices}
                      placeholder={licenseTypePlaceholder}
                      disabled={!formData.occupation}
                    />
                  </FormField>
                  <FormField label="License Number" error={fieldErrors.licenseNumber}>
                    <Input
                      value={formData.licenseNumber}
                      onChange={(e) => updateField("licenseNumber", e.target.value)}
                      placeholder="Enter license number"
                      error={!!fieldErrors.licenseNumber}
                    />
                  </FormField>
                  <FormField label="License Expiration" error={fieldErrors.licenseExpiration}>
                    <DatePicker
                      key={`license-expiration-${supervisorId}-${formData.licenseExpiration || "empty"}`}
                      id={`supervisor-license-expiration-${supervisorId}`}
                      placeholder="Select expiration date"
                      defaultDate={formData.licenseExpiration || undefined}
                      onChange={(_selectedDates, dateStr) =>
                        updateField("licenseExpiration", dateStr)
                      }
                    />
                  </FormField>
                  <FormField label="Years of Experience" error={fieldErrors.yearsOfExperience}>
                    <Select
                      value={formData.yearsOfExperience}
                      onChange={(v) => updateField("yearsOfExperience", v)}
                      options={choicesOnly(supervisorYearsOfExperienceSelectOptions)}
                      placeholder={optionsStillLoading ? "Loading…" : "Select experience"}
                    />
                  </FormField>
                </div>
                <FormField label="States of Licensure" required error={fieldErrors.stateOfLicensure}>
                  <MultiSelect
                    label=""
                    options={stateMultiOptions}
                    value={formData.stateOfLicensure}
                    onChange={(selected) => updateField("stateOfLicensure", selected)}
                    placeholder="Select states..."
                  />
                </FormField>

                {/* License document upload */}
                <FormField label="License Document" error={fieldErrors.uploadLicense}>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => licenseInputRef.current?.click()}
                      disabled={isSaving}
                      className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Paperclip className="h-4 w-4 shrink-0" />
                      {selectedLicense ? "Change file" : "Upload file"}
                    </button>
                    {selectedLicense ? (
                      <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-300 min-w-0">
                        <span className="truncate max-w-[200px]">{selectedLicense.name}</span>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedLicense(null);
                            if (licenseInputRef.current) licenseInputRef.current.value = "";
                          }}
                          className="shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                        >
                          <XIcon className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ) : currentLicenseFileName ? (
                      <span className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-[200px]">
                        Current: {currentLicenseFileName}
                      </span>
                    ) : null}
                    <input
                      ref={licenseInputRef}
                      type="file"
                      accept=".jpeg,.jpg,.png,.pdf,.doc,.docx"
                      onChange={handleLicenseSelect}
                      className="sr-only"
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    JPEG, PNG, PDF, DOC, DOCX · max 5 MB
                  </p>
                </FormField>
                <FormField label="About" required error={fieldErrors.describeYourself}>
                  <TextArea
                    value={formData.describeYourself}
                    onChange={(v) => updateField("describeYourself", v)}
                    rows={4}
                    placeholder="Describe yourself as a supervisor…"
                    maxLength={SUPERVISOR_PROFILE_TEXT_MAX_LENGTH}
                    error={!!fieldErrors.describeYourself}
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    {formData.describeYourself.length}/{SUPERVISOR_PROFILE_TEXT_MAX_LENGTH} characters
                  </p>
                </FormField>
                <FormField
                  label="Professional Summary"
                  required
                  error={fieldErrors.professionalSummary}
                >
                  <TextArea
                    value={formData.professionalSummary}
                    onChange={(v) => updateField("professionalSummary", v)}
                    rows={4}
                    placeholder="Summarize professional background and expertise…"
                    maxLength={SUPERVISOR_PROFILE_TEXT_MAX_LENGTH}
                    error={!!fieldErrors.professionalSummary}
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    {formData.professionalSummary.length}/{SUPERVISOR_PROFILE_TEXT_MAX_LENGTH}{" "}
                    characters
                  </p>
                </FormField>
              </section>

              {/* Supervision preferences */}
              <section className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Supervision preferences
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField label="Supervision Format" error={fieldErrors.supervisionFormat}>
                    <Select
                      value={formData.supervisionFormat}
                      onChange={(v) => updateField("supervisionFormat", v)}
                      options={choicesOnly(formatOptions)}
                      placeholder={optionsStillLoading ? "Loading…" : "Select format"}
                    />
                  </FormField>
                  <FormField label="Availability" error={fieldErrors.availability}>
                    <Select
                      value={formData.availability}
                      onChange={(v) => updateField("availability", v)}
                      options={choicesOnly(availabilityOptions)}
                      placeholder={optionsStillLoading ? "Loading…" : "Select availability"}
                    />
                  </FormField>
                  <FormField label="Accepting Supervisees" error={fieldErrors.acceptingSupervisees}>
                    <Select
                      value={formData.acceptingSupervisees ? "true" : "false"}
                      onChange={(v) => updateField("acceptingSupervisees", v === "true")}
                      options={[
                        { value: "true", label: "Yes" },
                        { value: "false", label: "No" },
                      ]}
                      placeholder="Select"
                    />
                  </FormField>
                </div>
                <FormField label="Certifications" error={fieldErrors.certification}>
                  <MultiSelect
                    label=""
                    options={certMultiOptions}
                    value={formData.certification}
                    onChange={(selected) => updateField("certification", selected)}
                    placeholder="Select certifications..."
                  />
                </FormField>
                <FormField label="Patient Population" error={fieldErrors.patientPopulation}>
                  <MultiSelect
                    label=""
                    options={patientPopMultiOptions}
                    value={formData.patientPopulation}
                    onChange={(selected) => updateField("patientPopulation", selected)}
                    placeholder="Select patient populations..."
                  />
                </FormField>
              </section>

              {/* Fee */}
              <section className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Supervision fee
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField label="Fee Type" error={fieldErrors.supervisionFeeType}>
                    <Select
                      value={formData.supervisionFeeType}
                      onChange={(v) => updateField("supervisionFeeType", v)}
                      options={
                        choicesOnly(feeTypeOptions).length > 0
                          ? choicesOnly(feeTypeOptions)
                          : [
                              { value: "HOURLY", label: "Hourly" },
                              { value: "MONTHLY", label: "Monthly" },
                            ]
                      }
                      placeholder="Select fee type"
                    />
                  </FormField>
                  <FormField label="Fee Amount ($)" error={fieldErrors.supervisionFeeAmount}>
                    <Input
                      type="number"
                      min={0}
                      value={formData.supervisionFeeAmount}
                      onChange={(e) => updateField("supervisionFeeAmount", e.target.value)}
                      placeholder="0"
                      error={!!fieldErrors.supervisionFeeAmount}
                    />
                  </FormField>
                </div>
              </section>
            </div>
          )}
        </div>

        <div className="p-6 pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
          <Button variant="outline" onClick={handleClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={saveChanges} disabled={isLoading || isSaving}>
            {isSaving ? "Saving..." : "Save changes"}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default EditSupervisorModal;
