"use client";

import React, { useMemo } from "react";
import Select from "@/components/form/Select";
import MultiSelect from "@/components/form/MultiSelect";
import Checkbox from "@/components/form/input/Checkbox";
import Input from "@/components/ui/input/Input";
import { FormField } from "@/components/ui/form";
import {
  CUSTOM_GENDER_IDENTITY_MAX_LENGTH,
  GENDER_IDENTITY_OPTIONS,
  GENDER_IDENTITY_SELF_DESCRIBE,
  LANGUAGE_OPTIONS,
  PRONOUN_OPTIONS,
} from "@/constants/identityPreferences";
import type {
  IdentityPreferencesFieldErrors,
  IdentityPreferencesFormData,
} from "@/services/utils/identityPreferencesForm";

interface IdentityPreferencesFieldsProps {
  value: IdentityPreferencesFormData;
  onChange: (next: IdentityPreferencesFormData) => void;
  errors?: IdentityPreferencesFieldErrors;
  disabled?: boolean;
}

/**
 * Pronouns, gender identity, and languages — each optional and each with its
 * own "display on public profile" checkbox. Shared by the supervisor and
 * supervisee edit modals; mirrors the block the users see at signup.
 */
export function IdentityPreferencesFields({
  value,
  onChange,
  errors = {},
  disabled = false,
}: IdentityPreferencesFieldsProps) {
  const pronounMultiOptions = useMemo(
    () => PRONOUN_OPTIONS.map((o) => ({ value: o.value, text: o.label, selected: false })),
    []
  );
  const languageMultiOptions = useMemo(
    () => LANGUAGE_OPTIONS.map((o) => ({ value: o.value, text: o.label, selected: false })),
    []
  );
  const genderChoices = useMemo(() => GENDER_IDENTITY_OPTIONS.map((o) => ({ value: o.value, label: o.label })), []);

  const set = <K extends keyof IdentityPreferencesFormData>(key: K, next: IdentityPreferencesFormData[K]) => {
    const updated = { ...value, [key]: next };
    // The written identity only exists alongside "Prefer to self-describe".
    if (key === "genderIdentity" && next !== GENDER_IDENTITY_SELF_DESCRIBE) {
      updated.customGenderIdentity = "";
    }
    onChange(updated);
  };

  const isSelfDescribe = value.genderIdentity === GENDER_IDENTITY_SELF_DESCRIBE;

  return (
    <section className="space-y-4">
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
        Identity &amp; public visibility
      </h3>
      <p className="text-xs text-gray-500 dark:text-gray-400 -mt-2">
        Optional. Each block appears on the public profile only while its checkbox is on; &quot;Prefer not to say&quot;
        is never shown publicly.
      </p>

      <div className="space-y-2">
        <FormField label="Pronouns" error={errors.pronouns}>
          <MultiSelect
            label=""
            options={pronounMultiOptions}
            value={value.pronouns}
            onChange={(selected) => set("pronouns", selected)}
            placeholder="Select pronouns..."
            disabled={disabled}
          />
        </FormField>
        <Checkbox
          label="Display pronouns on public profile"
          checked={value.showPronouns}
          onChange={(checked) => set("showPronouns", checked)}
          disabled={disabled}
        />
      </div>

      <div className="space-y-2">
        <FormField label="Gender Identity" error={errors.genderIdentity}>
          <Select
            value={value.genderIdentity}
            onChange={(v) => set("genderIdentity", v)}
            options={genderChoices}
            placeholder="Select gender identity"
            disabled={disabled}
          />
        </FormField>
        {isSelfDescribe && (
          <FormField label="Self-described gender identity" required error={errors.customGenderIdentity}>
            <Input
              value={value.customGenderIdentity}
              onChange={(e) => set("customGenderIdentity", e.target.value)}
              placeholder="Enter the gender identity"
              maxLength={CUSTOM_GENDER_IDENTITY_MAX_LENGTH}
              error={!!errors.customGenderIdentity}
              disabled={disabled}
            />
          </FormField>
        )}
        <Checkbox
          label="Display gender identity on public profile"
          checked={value.showGenderIdentity}
          onChange={(checked) => set("showGenderIdentity", checked)}
          disabled={disabled}
        />
      </div>

      <div className="space-y-2">
        <FormField label="Languages" error={errors.languages}>
          <MultiSelect
            label=""
            options={languageMultiOptions}
            value={value.languages}
            onChange={(selected) => set("languages", selected)}
            placeholder="Select languages..."
            disabled={disabled}
          />
        </FormField>
        <Checkbox
          label="Display languages on public profile"
          checked={value.showLanguages}
          onChange={(checked) => set("showLanguages", checked)}
          disabled={disabled}
        />
      </div>
    </section>
  );
}

export default IdentityPreferencesFields;
