"use client";

import React, { useMemo } from "react";
import { Plus, Trash2 } from "lucide-react";
import Input from "@/components/ui/input/Input";
import Select from "@/components/form/Select";
import DatePicker from "@/components/form/date-picker";
import Checkbox from "@/components/form/input/Checkbox";
import { FormField } from "@/components/ui/form";
import type { SupervisorTypeData } from "@/services/api/supervisorTypes";
import {
  emptySupervisorBoardCertification,
  emptySupervisorLicenseEntry,
  type SupervisorBoardCertificationFormData,
  type SupervisorEditFormData,
  type SupervisorFieldErrors,
  type SupervisorLicenseEntryFormData,
  type SupervisorOfferingFormData,
} from "@/services/utils/supervisorProfileForm";
import {
  MEDICAL_DIRECTOR_OFFERING_TYPE_NAMES,
  type MedicalDirectorOfferingKey,
  OTHER_CERTIFYING_BOARD_VALUE,
  certifyingBoardSelectOptions,
  getSupervisorCredentialSelectOptions,
  isMedicalDirectorSupervisorType,
} from "@/constants/supervisorSignupOptions";

type SelectChoice = { label: string; value: string };

interface EditSupervisorMedicalDirectorFieldsProps {
  formData: SupervisorEditFormData;
  setFormData: React.Dispatch<React.SetStateAction<SupervisorEditFormData>>;
  fieldErrors: SupervisorFieldErrors;
  setFieldErrors: React.Dispatch<React.SetStateAction<SupervisorFieldErrors>>;
  supervisorTypesData: SupervisorTypeData[];
  stateOptions: SelectChoice[];
  statesLoading: boolean;
  isSaving: boolean;
  supervisorId: string;
}

const OFFERING_KEYS: MedicalDirectorOfferingKey[] = ["supervising", "collaborating"];

/**
 * Medical Director extras for the admin Edit Supervisor modal: the
 * "Board Certified?" section and the Supervising/Collaborating Physician
 * offering blocks. Mirrors the user-facing profile edit; full-replace on save.
 */
export const EditSupervisorMedicalDirectorFields: React.FC<
  EditSupervisorMedicalDirectorFieldsProps
> = ({
  formData,
  setFormData,
  fieldErrors,
  setFieldErrors,
  supervisorTypesData,
  stateOptions,
  statesLoading,
  isSaving,
  supervisorId,
}) => {
  const offeringTypeData = useMemo(() => {
    const byKey: Partial<Record<MedicalDirectorOfferingKey, SupervisorTypeData>> = {};
    for (const key of OFFERING_KEYS) {
      byKey[key] = supervisorTypesData.find(
        (t) => t.name === MEDICAL_DIRECTOR_OFFERING_TYPE_NAMES[key],
      );
    }
    return byKey;
  }, [supervisorTypesData]);

  // Physician specialties for board certifications — every MD-type occupation
  // carries the same specialty list.
  const boardCertSpecialtyChoices = useMemo<SelectChoice[]>(() => {
    const medicalDirectorType = supervisorTypesData.find((t) =>
      isMedicalDirectorSupervisorType(t.name),
    );
    const source = medicalDirectorType?.occupations.find(
      (occupation) => occupation.specialties.length > 0,
    );
    return source?.specialties.map((s) => ({ label: s.name, value: s.name })) ?? [];
  }, [supervisorTypesData]);

  const updateOfferingFlag = (key: MedicalDirectorOfferingKey, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      [key === "supervising" ? "offerSupervisingPhysician" : "offerCollaboratingPhysician"]:
        checked,
    }));
    if (!checked) {
      setFieldErrors((prev) => {
        if (!prev.offeringErrors?.[key]) return prev;
        const { [key]: _, ...rest } = prev.offeringErrors;
        return { ...prev, offeringErrors: rest };
      });
    }
  };

  const updateOfferingField = (
    key: MedicalDirectorOfferingKey,
    field: keyof Omit<SupervisorOfferingFormData, "licenses">,
    value: string,
  ) => {
    setFormData((prev) => {
      const block = { ...prev.offerings[key], [field]: value };
      // Specialty/degree options cascade from the occupation.
      if (field === "occupation") {
        block.specialty = "";
        block.degreeType = "";
      }
      return { ...prev, offerings: { ...prev.offerings, [key]: block } };
    });
    setFieldErrors((prev) => {
      const blockErrors = prev.offeringErrors?.[key];
      if (!blockErrors || !(field in blockErrors)) return prev;
      const { [field as "occupation" | "degreeType"]: _, ...rest } = blockErrors;
      return { ...prev, offeringErrors: { ...prev.offeringErrors, [key]: rest } };
    });
  };

  const updateOfferingLicense = (
    key: MedicalDirectorOfferingKey,
    index: number,
    field: keyof SupervisorLicenseEntryFormData,
    value: string,
  ) => {
    setFormData((prev) => ({
      ...prev,
      offerings: {
        ...prev.offerings,
        [key]: {
          ...prev.offerings[key],
          licenses: prev.offerings[key].licenses.map((entry, i) =>
            i === index ? { ...entry, [field]: value } : entry,
          ),
        },
      },
    }));
    setFieldErrors((prev) => {
      const blockErrors = prev.offeringErrors?.[key];
      if (!blockErrors?.licenses && !blockErrors?.licenseEntries?.[index]?.[field]) return prev;
      const licenseEntries = blockErrors.licenseEntries?.map((entryErrors, i) => {
        if (i !== index) return entryErrors;
        const { [field]: _, ...rest } = entryErrors;
        return rest;
      });
      return {
        ...prev,
        offeringErrors: {
          ...prev.offeringErrors,
          [key]: { ...blockErrors, licenses: undefined, licenseEntries },
        },
      };
    });
  };

  const addOfferingLicense = (key: MedicalDirectorOfferingKey) => {
    setFormData((prev) => ({
      ...prev,
      offerings: {
        ...prev.offerings,
        [key]: {
          ...prev.offerings[key],
          licenses: [...prev.offerings[key].licenses, emptySupervisorLicenseEntry()],
        },
      },
    }));
  };

  const removeOfferingLicense = (key: MedicalDirectorOfferingKey, index: number) => {
    setFormData((prev) => ({
      ...prev,
      offerings: {
        ...prev.offerings,
        [key]: {
          ...prev.offerings[key],
          licenses: prev.offerings[key].licenses.filter((_, i) => i !== index),
        },
      },
    }));
  };

  const setBoardCertified = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, boardCertified: checked }));
    if (!checked) {
      setFieldErrors((prev) => ({
        ...prev,
        boardCertifications: undefined,
        boardCertificationEntries: undefined,
      }));
    }
  };

  const updateBoardCertification = (
    index: number,
    field: keyof SupervisorBoardCertificationFormData,
    value: string,
  ) => {
    setFormData((prev) => ({
      ...prev,
      boardCertifications: prev.boardCertifications.map((entry, i) =>
        i === index ? { ...entry, [field]: value } : entry,
      ),
    }));
    setFieldErrors((prev) => {
      if (!prev.boardCertifications && !prev.boardCertificationEntries?.[index]?.[field]) {
        return prev;
      }
      const boardCertificationEntries = prev.boardCertificationEntries?.map((entryErrors, i) => {
        if (i !== index) return entryErrors;
        const { [field]: _, ...rest } = entryErrors;
        return rest;
      });
      return { ...prev, boardCertifications: undefined, boardCertificationEntries };
    });
  };

  const addBoardCertification = () => {
    setFormData((prev) => ({
      ...prev,
      boardCertifications: [...prev.boardCertifications, emptySupervisorBoardCertification()],
    }));
  };

  const removeBoardCertification = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      boardCertifications: prev.boardCertifications.filter((_, i) => i !== index),
    }));
    setFieldErrors((prev) => {
      if (!prev.boardCertificationEntries) return prev;
      return {
        ...prev,
        boardCertifications: undefined,
        boardCertificationEntries: prev.boardCertificationEntries.filter((_, i) => i !== index),
      };
    });
  };

  return (
    <>
      {/* Board certification */}
      <section className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
          Board Certification
        </h3>
        <FormField label="Board Certified?" error={fieldErrors.boardCertifications}>
          <Select
            value={formData.boardCertified ? "true" : "false"}
            onChange={(v) => setBoardCertified(v === "true")}
            options={[
              { value: "true", label: "Yes" },
              { value: "false", label: "No" },
            ]}
            placeholder="Select"
          />
        </FormField>
        {formData.boardCertified ? (
          <div className="space-y-4">
            {formData.boardCertifications.map((entry, index) => {
              const entryErrors = fieldErrors.boardCertificationEntries?.[index] ?? {};
              return (
                <div
                  key={index}
                  className="space-y-4 rounded-lg border border-gray-200 dark:border-gray-700 p-4"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Board Certification {index + 1}
                    </p>
                    {formData.boardCertifications.length > 1 ? (
                      <button
                        type="button"
                        onClick={() => removeBoardCertification(index)}
                        disabled={isSaving}
                        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
                        aria-label={`Remove board certification ${index + 1}`}
                      >
                        <Trash2 className="h-4 w-4" />
                        Remove
                      </button>
                    ) : null}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      label="Certifying Board"
                      required
                      error={entryErrors.certifyingBoard}
                    >
                      <Select
                        value={entry.certifyingBoard}
                        onChange={(v) => updateBoardCertification(index, "certifyingBoard", v)}
                        options={certifyingBoardSelectOptions}
                        placeholder="Select certifying board"
                      />
                    </FormField>
                    <FormField label="Specialty" required error={entryErrors.specialty}>
                      <Select
                        value={entry.specialty}
                        onChange={(v) => updateBoardCertification(index, "specialty", v)}
                        options={boardCertSpecialtyChoices}
                        placeholder="Select specialty"
                      />
                    </FormField>
                    {entry.certifyingBoard === OTHER_CERTIFYING_BOARD_VALUE ? (
                      <FormField
                        label="Certifying Board (Other)"
                        required
                        error={entryErrors.certifyingBoardOther}
                      >
                        <Input
                          value={entry.certifyingBoardOther}
                          onChange={(e) =>
                            updateBoardCertification(index, "certifyingBoardOther", e.target.value)
                          }
                          placeholder="Enter certifying board name"
                          error={!!entryErrors.certifyingBoardOther}
                        />
                      </FormField>
                    ) : null}
                    <FormField label="Subspecialty (optional)">
                      <Input
                        value={entry.subspecialty}
                        onChange={(e) =>
                          updateBoardCertification(index, "subspecialty", e.target.value)
                        }
                        placeholder="Enter subspecialty"
                      />
                    </FormField>
                    <FormField label="Certification Number (optional)">
                      <Input
                        value={entry.certificationNumber}
                        onChange={(e) =>
                          updateBoardCertification(index, "certificationNumber", e.target.value)
                        }
                        placeholder="Enter certification number"
                      />
                    </FormField>
                    <FormField label="Expiration / Valid Through (optional)">
                      <DatePicker
                        key={`board-cert-expiration-${supervisorId}-${index}-${entry.expirationDate || "empty"}`}
                        id={`supervisor-board-cert-expiration-${supervisorId}-${index}`}
                        placeholder="Select expiration date"
                        defaultDate={entry.expirationDate || undefined}
                        onChange={(_selectedDates, dateStr) =>
                          updateBoardCertification(index, "expirationDate", dateStr)
                        }
                      />
                    </FormField>
                  </div>
                </div>
              );
            })}
            <button
              type="button"
              onClick={addBoardCertification}
              disabled={isSaving}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="h-4 w-4" />
              Add another certification
            </button>
          </div>
        ) : null}
      </section>

      {/* Secondary offerings */}
      <section className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
          Additional Physician Offerings
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Services additionally offered as a Supervising and/or Collaborating Physician. Each
          offering carries its own credentials.
        </p>
        {OFFERING_KEYS.map((key) => {
          const checked =
            key === "supervising"
              ? formData.offerSupervisingPhysician
              : formData.offerCollaboratingPhysician;
          const typeData = offeringTypeData[key];
          const block = formData.offerings[key];
          const blockErrors = fieldErrors.offeringErrors?.[key] ?? {};
          const occupationChoices =
            typeData?.occupations.map((o) => ({ label: o.name, value: o.name })) ?? [];
          const selectedOccupation = typeData?.occupations.find(
            (o) => o.name === block.occupation,
          );
          const specialtyChoices =
            selectedOccupation?.specialties.map((s) => ({ label: s.name, value: s.name })) ?? [];
          const degreeChoices = getSupervisorCredentialSelectOptions(
            typeData,
            selectedOccupation,
          );

          return (
            <div key={key} className="space-y-4">
              <Checkbox
                label={`Offer as ${MEDICAL_DIRECTOR_OFFERING_TYPE_NAMES[key]}`}
                checked={checked}
                onChange={(isChecked) => updateOfferingFlag(key, isChecked)}
                disabled={isSaving}
              />
              {checked ? (
                <div className="space-y-4 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    {MEDICAL_DIRECTOR_OFFERING_TYPE_NAMES[key]} Credentials
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField label="Occupation" required error={blockErrors.occupation}>
                      <Select
                        value={block.occupation}
                        onChange={(v) => updateOfferingField(key, "occupation", v)}
                        options={occupationChoices}
                        placeholder="Select occupation"
                      />
                    </FormField>
                    <FormField label="Specialty">
                      <Select
                        value={block.specialty}
                        onChange={(v) => updateOfferingField(key, "specialty", v)}
                        options={specialtyChoices}
                        placeholder={
                          !block.occupation ? "Select an occupation first" : "Select specialty"
                        }
                        disabled={!block.occupation}
                      />
                    </FormField>
                    <FormField label="Degree Type" required error={blockErrors.degreeType}>
                      <Select
                        value={block.degreeType}
                        onChange={(v) => updateOfferingField(key, "degreeType", v)}
                        options={degreeChoices}
                        placeholder="Select degree type"
                      />
                    </FormField>
                  </div>

                  <FormField label="Licenses" error={blockErrors.licenses}>
                    <div className="space-y-4">
                      {block.licenses.map((entry, index) => {
                        const entryErrors = blockErrors.licenseEntries?.[index] ?? {};
                        return (
                          <div
                            key={index}
                            className="space-y-4 rounded-lg border border-gray-200 dark:border-gray-700 p-4"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                License {index + 1}
                              </p>
                              {block.licenses.length > 1 ? (
                                <button
                                  type="button"
                                  onClick={() => removeOfferingLicense(key, index)}
                                  disabled={isSaving}
                                  className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
                                  aria-label={`Remove license ${index + 1}`}
                                >
                                  <Trash2 className="h-4 w-4" />
                                  Remove
                                </button>
                              ) : null}
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <FormField
                                label="State of Licensure"
                                required
                                error={entryErrors.state}
                              >
                                <Select
                                  value={entry.state}
                                  onChange={(v) => updateOfferingLicense(key, index, "state", v)}
                                  options={stateOptions}
                                  placeholder={statesLoading ? "Loading…" : "Select state"}
                                  disabled={statesLoading}
                                />
                              </FormField>
                              <FormField
                                label="License Number"
                                required
                                error={entryErrors.licenseNumber}
                              >
                                <Input
                                  value={entry.licenseNumber}
                                  onChange={(e) =>
                                    updateOfferingLicense(
                                      key,
                                      index,
                                      "licenseNumber",
                                      e.target.value,
                                    )
                                  }
                                  placeholder="Enter license number"
                                  error={!!entryErrors.licenseNumber}
                                />
                              </FormField>
                              <FormField
                                label="License Expiration Date"
                                required
                                error={entryErrors.licenseExpiration}
                              >
                                <DatePicker
                                  key={`offering-${key}-license-expiration-${supervisorId}-${index}-${entry.licenseExpiration || "empty"}`}
                                  id={`supervisor-offering-${key}-license-expiration-${supervisorId}-${index}`}
                                  placeholder="Select expiration date"
                                  defaultDate={entry.licenseExpiration || undefined}
                                  onChange={(_selectedDates, dateStr) =>
                                    updateOfferingLicense(key, index, "licenseExpiration", dateStr)
                                  }
                                />
                              </FormField>
                            </div>
                          </div>
                        );
                      })}
                      <button
                        type="button"
                        onClick={() => addOfferingLicense(key)}
                        disabled={isSaving}
                        className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Plus className="h-4 w-4" />
                        Add another license
                      </button>
                    </div>
                  </FormField>
                </div>
              ) : null}
            </div>
          );
        })}
      </section>
    </>
  );
};

export default EditSupervisorMedicalDirectorFields;
