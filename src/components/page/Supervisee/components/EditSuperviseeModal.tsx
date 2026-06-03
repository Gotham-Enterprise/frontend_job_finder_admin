"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import Input from "@/components/ui/input/Input";
import Select from "@/components/form/Select";
import MultiSelect from "@/components/form/MultiSelect";
import USPhoneInput from "@/components/ui/USPhoneInput";
import { FormField } from "@/components/ui/form";
import Alert from "@/components/ui/alert/Alert";
import ProfilePhotoUpload from "@/components/ui/ProfilePhotoUpload";
import TextArea from "@/components/form/input/TextArea";
import { superviseeApi } from "@/services/api/supervisee";
import { useCitiesByState } from "@/lib/useStatesCities";
import {
  formDataToUpdatePayload,
  mapSuperviseeDetailsToFormData,
  validateSuperviseeEditForm,
  type SuperviseeEditFormData,
  type SuperviseeFieldErrors,
} from "@/services/utils/superviseeProfileForm";
import {
  useUpdateSupervisee,
  useSuperviseeFormOptions,
  useSupervisorTypesData,
  useSpecialtiesByOccupation,
} from "@/services/hooks/useSupervisees";
import { useStates } from "@/services/hooks/useStates";
import { useOccupationsWithSpecialties } from "@/services/hooks/useJobCreation";

interface EditSuperviseeModalProps {
  isOpen: boolean;
  onClose: () => void;
  superviseeId: string;
  superviseeName?: string;
  onUpdate: () => void;
}

const CREDENTIAL_TITLE_LABEL = "Credential or License Type";
const CREDENTIAL_TITLE_PLACEHOLDER = "e.g. AMFT, LPC-Associate, ACSW, PA";

const emptyForm = (): SuperviseeEditFormData => ({
  fullName: "",
  contactNumber: "",
  city: "",
  state: "",
  zipcode: "",
  occupation: "",
  specialty: "",
  title: "",
  stateOfLicensure: [],
  typeOfSupervisorNeeded: "",
  superviseeOccupation: "",
  superviseeSpecialty: "",
  howSoonLooking: "",
  lookingDate: "",
  preferredFormat: "",
  availability: "",
  idealSupervisor: "",
  stateTheyAreLookingIn: [],
  budgetRangeType: "",
  budgetRangeStart: "",
  budgetRangeEnd: "",
});

type SelectChoice = { label: string; value: string };

function choicesOnly(items: SelectChoice[]): SelectChoice[] {
  return items.filter((o) => o.value !== "");
}

export const EditSuperviseeModal: React.FC<EditSuperviseeModalProps> = ({
  isOpen,
  onClose,
  superviseeId,
  superviseeName,
  onUpdate,
}) => {
  const [formData, setFormData] = useState<SuperviseeEditFormData>(emptyForm);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<SuperviseeFieldErrors>({});
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [currentPhotoUrl, setCurrentPhotoUrl] = useState<string | null>(null);

  const { mutate: updateMutate, isPending: isSaving } = useUpdateSupervisee();
  const { formatOptions, howSoonOptions, availabilityOptions, budgetTypeOptions, isLoading: optionsLoading } =
    useSuperviseeFormOptions();
  const { data: supervisorTypesData = [], isLoading: supervisorTypesLoading } =
    useSupervisorTypesData();
  const { data: statesData, isLoading: statesLoading } = useStates();
  const stateAbbr = formData.state?.trim() || null;
  const { data: cities = [], isLoading: citiesLoading } = useCitiesByState(stateAbbr);
  const { data: occupationsData } = useOccupationsWithSpecialties();
  const { data: profileSpecialtyOptions = [], isLoading: profileSpecialtiesLoading } =
    useSpecialtiesByOccupation(formData.occupation);

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

  const profileOccupationChoices = useMemo(
    () =>
      choicesOnly(
        occupationsData?.success && occupationsData.data
          ? occupationsData.data.map((o) => ({ value: o.id.toString(), label: o.name }))
          : [],
      ),
    [occupationsData],
  );

  const profileSpecialtyChoices = useMemo(
    () => choicesOnly(formData.occupation ? profileSpecialtyOptions : []),
    [formData.occupation, profileSpecialtyOptions],
  );

  const profileSpecialtyPlaceholder = useMemo(() => {
    if (!formData.occupation) return "Select an occupation first";
    if (profileSpecialtiesLoading) return "Loading…";
    if (profileSpecialtyOptions.length === 0) return "No specialties available";
    return "Select specialty (optional)";
  }, [formData.occupation, profileSpecialtiesLoading, profileSpecialtyOptions.length]);

  const supervisorTypeChoices = useMemo(
    () => choicesOnly(supervisorTypesData.map((t) => ({ label: t.name, value: t.name }))),
    [supervisorTypesData],
  );

  const supervisionOccupationChoices = useMemo(() => {
    if (!formData.typeOfSupervisorNeeded) return [];
    const selectedType = supervisorTypesData.find(
      (t) => t.name === formData.typeOfSupervisorNeeded,
    );
    return choicesOnly(
      selectedType?.occupations.map((o) => ({ label: o.name, value: o.name })) ?? [],
    );
  }, [formData.typeOfSupervisorNeeded, supervisorTypesData]);

  const supervisionOccupationPlaceholder = useMemo(() => {
    if (!formData.typeOfSupervisorNeeded) return "Select a type of supervision first";
    if (supervisionOccupationChoices.length === 0) return "No occupations available";
    return "Select occupation";
  }, [formData.typeOfSupervisorNeeded, supervisionOccupationChoices.length]);

  const supervisionSpecialtyChoices = useMemo(() => {
    if (!formData.typeOfSupervisorNeeded || !formData.superviseeOccupation) return [];
    const selectedType = supervisorTypesData.find(
      (t) => t.name === formData.typeOfSupervisorNeeded,
    );
    const selectedOccupation = selectedType?.occupations.find(
      (o) => o.name === formData.superviseeOccupation,
    );
    return choicesOnly(
      selectedOccupation?.specialties.map((s) => ({ label: s.name, value: s.name })) ?? [],
    );
  }, [
    formData.typeOfSupervisorNeeded,
    formData.superviseeOccupation,
    supervisorTypesData,
  ]);

  const supervisionSpecialtyPlaceholder = useMemo(() => {
    if (!formData.superviseeOccupation) return "Select an occupation first";
    if (supervisionSpecialtyChoices.length === 0) return "No specialties available";
    return "Select specialty";
  }, [formData.superviseeOccupation, supervisionSpecialtyChoices.length]);

  const handleClose = () => {
    setSelectedFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setCurrentPhotoUrl(null);
    setLoadError(null);
    setFieldErrors({});
    setFormData(emptyForm());
    onClose();
  };

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const response = await superviseeApi.getSuperviseeById(superviseeId);
      if (response.success && response.data) {
        const statesList = statesData?.success ? statesData.data.states : [];
        setFormData(mapSuperviseeDetailsToFormData(response.data, statesList));
        setCurrentPhotoUrl(response.data.profilePhotoUrl);
      }
    } catch {
      setLoadError("Failed to load supervisee data");
    } finally {
      setIsLoading(false);
    }
  }, [superviseeId, statesData]);

  useEffect(() => {
    if (isOpen && superviseeId) loadData();
  }, [isOpen, superviseeId, loadData]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const updateField = <K extends keyof SuperviseeEditFormData>(
    field: K,
    value: SuperviseeEditFormData[K],
  ) => {
    setFormData((prev) => {
      const next = { ...prev, [field]: value };
      if (field === "occupation") next.specialty = "";
      if (field === "typeOfSupervisorNeeded") {
        next.superviseeOccupation = "";
        next.superviseeSpecialty = "";
      }
      if (field === "superviseeOccupation") next.superviseeSpecialty = "";
      if (field === "state") next.city = "";
      return next;
    });
    setFieldErrors((prev) => {
      if (!prev[field]) return prev;
      const { [field]: _, ...rest } = prev;
      return rest;
    });
  };

  const handleFileSelect = (file: File) => {
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
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setFieldErrors((prev) => {
      if (!prev.uploadProfilePhoto) return prev;
      const { uploadProfilePhoto: _, ...rest } = prev;
      return rest;
    });
  };

  const saveChanges = () => {
    const errors = validateSuperviseeEditForm(formData);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});

    const payload = formDataToUpdatePayload(formData, selectedFile ?? undefined);
    updateMutate(
      { id: superviseeId, payload },
      {
        onSuccess: () => {
          onUpdate();
          handleClose();
        },
      },
    );
  };

  const isCustomDate = formData.howSoonLooking === "CUSTOM_DATE";
  const optionsStillLoading = optionsLoading || supervisorTypesLoading;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      isFullscreen={false}
      className="max-w-3xl mx-auto mt-8 mb-8 rounded-lg shadow-xl max-h-[90vh] overflow-y"
    >
      <div className="flex flex-col max-h-[90vh]">
        <div className="p-6 pb-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Edit Supervisee</h2>
          {superviseeName && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{superviseeName}</p>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {loadError && (
            <div className="mb-4">
              <Alert variant="error" title="Unable to load supervisee" message={loadError} />
            </div>
          )}

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brand-500" />
              <span className="ml-2 text-gray-600 dark:text-gray-400">Loading...</span>
            </div>
          ) : (
            <div className="space-y-8">
              <FormField label="Profile photo" error={fieldErrors.uploadProfilePhoto}>
                <ProfilePhotoUpload
                  displayUrl={previewUrl || currentPhotoUrl}
                  displayName={formData.fullName || superviseeName || "Supervisee"}
                  hasPendingUpload={Boolean(selectedFile)}
                  onFileSelect={handleFileSelect}
                  disabled={isSaving}
                />
              </FormField>

              <section className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Personal information
                </h3>
                <div className="grid grid-cols-1 gap-4">
                  <FormField label="Full name" required error={fieldErrors.fullName}>
                    <Input
                      value={formData.fullName}
                      onChange={(e) => updateField("fullName", e.target.value)}
                      placeholder="Enter full name"
                      error={!!fieldErrors.fullName}
                    />
                  </FormField>
                  <FormField label="Contact number" required error={fieldErrors.contactNumber}>
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
                  <FormField label="Zipcode" required error={fieldErrors.zipcode}>
                    <Input
                      value={formData.zipcode}
                      onChange={(e) => updateField("zipcode", e.target.value)}
                      placeholder="ZIP"
                      error={!!fieldErrors.zipcode}
                    />
                  </FormField>
                </div>
              </section>

              <section className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Occupation & licensure
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 -mt-2">
                  The supervisee&apos;s own profession (stored on their account).
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField label="Occupation" required error={fieldErrors.occupation}>
                    <Select
                      value={formData.occupation}
                      onChange={(v) => updateField("occupation", v)}
                      options={profileOccupationChoices}
                      placeholder="Select occupation"
                    />
                  </FormField>
                  <FormField label="Specialty">
                    <Select
                      value={formData.specialty}
                      onChange={(v) => updateField("specialty", v)}
                      options={profileSpecialtyChoices}
                      placeholder={profileSpecialtyPlaceholder}
                    />
                  </FormField>
                  <FormField
                    className="sm:col-span-2"
                    label={CREDENTIAL_TITLE_LABEL}
                    required
                    error={fieldErrors.title}
                  >
                    <Input
                      value={formData.title}
                      onChange={(e) => updateField("title", e.target.value)}
                      placeholder={CREDENTIAL_TITLE_PLACEHOLDER}
                      error={!!fieldErrors.title}
                    />
                  </FormField>
                </div>
                <FormField label="States of licensure" required error={fieldErrors.stateOfLicensure}>
                  <MultiSelect
                    label=""
                    options={stateMultiOptions}
                    value={formData.stateOfLicensure}
                    onChange={(selected) => updateField("stateOfLicensure", selected)}
                    placeholder="Select states..."
                  />
                </FormField>
              </section>

              <section className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Supervision needs
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 -mt-2">
                  What kind of supervisor they are looking for (same options as signup).
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    className="sm:col-span-2"
                    label="Type of supervision needed"
                    required
                    error={fieldErrors.typeOfSupervisorNeeded}
                  >
                    <Select
                      value={formData.typeOfSupervisorNeeded}
                      onChange={(v) => updateField("typeOfSupervisorNeeded", v)}
                      options={supervisorTypeChoices}
                      placeholder={
                        supervisorTypesLoading ? "Loading…" : "Select type of supervision"
                      }
                    />
                  </FormField>
                  <FormField label="Occupation" required error={fieldErrors.superviseeOccupation}>
                    <Select
                      value={formData.superviseeOccupation}
                      onChange={(v) => updateField("superviseeOccupation", v)}
                      options={supervisionOccupationChoices}
                      placeholder={supervisionOccupationPlaceholder}
                    />
                  </FormField>
                  <FormField label="Specialty">
                    <Select
                      value={formData.superviseeSpecialty}
                      onChange={(v) => updateField("superviseeSpecialty", v)}
                      options={supervisionSpecialtyChoices}
                      placeholder={supervisionSpecialtyPlaceholder}
                    />
                  </FormField>
                  <FormField
                    label="How soon do you need supervision?"
                    required
                    error={fieldErrors.howSoonLooking}
                  >
                    <Select
                      value={formData.howSoonLooking}
                      onChange={(v) => updateField("howSoonLooking", v)}
                      options={choicesOnly(howSoonOptions)}
                      placeholder={optionsStillLoading ? "Loading…" : "Select timeline"}
                    />
                  </FormField>
                  {isCustomDate && (
                    <FormField label="Looking date" required error={fieldErrors.lookingDate}>
                      <Input
                        type="date"
                        value={formData.lookingDate}
                        onChange={(e) => updateField("lookingDate", e.target.value)}
                        error={!!fieldErrors.lookingDate}
                      />
                    </FormField>
                  )}
                  <FormField label="Preferred format" required error={fieldErrors.preferredFormat}>
                    <Select
                      value={formData.preferredFormat}
                      onChange={(v) => updateField("preferredFormat", v)}
                      options={choicesOnly(formatOptions)}
                      placeholder="Select format"
                    />
                  </FormField>
                  <FormField label="Availability" required error={fieldErrors.availability}>
                    <Select
                      value={formData.availability}
                      onChange={(v) => updateField("availability", v)}
                      options={choicesOnly(availabilityOptions)}
                      placeholder="Select availability"
                    />
                  </FormField>
                  <FormField label="Budget type" required error={fieldErrors.budgetRangeType}>
                    <Select
                      value={formData.budgetRangeType}
                      onChange={(v) => updateField("budgetRangeType", v)}
                      options={choicesOnly(budgetTypeOptions)}
                      placeholder="Select budget type"
                    />
                  </FormField>
                  <FormField label="Budget start ($)" required error={fieldErrors.budgetRangeStart}>
                    <Input
                      type="number"
                      min={0}
                      value={formData.budgetRangeStart}
                      onChange={(e) => updateField("budgetRangeStart", e.target.value)}
                      error={!!fieldErrors.budgetRangeStart}
                    />
                  </FormField>
                  <FormField label="Budget end ($)" required error={fieldErrors.budgetRangeEnd}>
                    <Input
                      type="number"
                      min={0}
                      value={formData.budgetRangeEnd}
                      onChange={(e) => updateField("budgetRangeEnd", e.target.value)}
                      error={!!fieldErrors.budgetRangeEnd}
                    />
                  </FormField>
                </div>
                <FormField
                  label="States they are looking in"
                  required
                  error={fieldErrors.stateTheyAreLookingIn}
                >
                  <MultiSelect
                    label=""
                    options={stateMultiOptions}
                    value={formData.stateTheyAreLookingIn}
                    onChange={(selected) => updateField("stateTheyAreLookingIn", selected)}
                    placeholder="Select states..."
                  />
                </FormField>
                <FormField
                  label="Description of ideal supervisor"
                  required
                  error={fieldErrors.idealSupervisor}
                >
                  <TextArea
                    value={formData.idealSupervisor}
                    onChange={(v) => updateField("idealSupervisor", v)}
                    rows={4}
                    placeholder="Describe ideal supervisor…"
                    error={!!fieldErrors.idealSupervisor}
                  />
                </FormField>
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

export default EditSuperviseeModal;
