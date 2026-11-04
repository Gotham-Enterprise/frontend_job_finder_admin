"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import Input from "@/components/ui/input/Input";
import Select from "@/components/form/Select";
import MultiSelect from "@/components/form/MultiSelect";
import Checkbox from "@/components/form/input/Checkbox";
import { useStates } from "@/services/hooks/useStates";
import { useDegrees, useOccupationsWithSpecialties } from "@/services/hooks/useJobCreation";
import { useCreateJobSeeker } from "@/services/hooks/useJobSeekers";
import { showToast } from "@/services/utils/toast";

interface CreateJobSeekerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type CreateForm = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phoneNumber: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  occupationId: string;
  specialtyIds: string[];
  degree: string;
  eligibilityToWorkInUS: string;
  requireVisaSponsorship: boolean;
  enableSMSJobAlerts: boolean;
  enableSMSMarketing: boolean;
  enableEmailNotification: boolean;
  enableNewsletter: boolean;
  agreeToTermsAndConditions: boolean;
  emailVerified: boolean;
};

const emptyForm = (): CreateForm => ({
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  confirmPassword: "",
  phoneNumber: "",
  address: "",
  city: "",
  state: "",
  zipCode: "",
  country: "US",
  occupationId: "",
  specialtyIds: [],
  degree: "",
  eligibilityToWorkInUS: "",
  requireVisaSponsorship: false,
  enableSMSJobAlerts: false,
  enableSMSMarketing: false,
  enableEmailNotification: false,
  enableNewsletter: false,
  agreeToTermsAndConditions: false,
  emailVerified: true,
});

const eligibilityOptions = [
  { value: "true", label: "Yes" },
  { value: "false", label: "No" },
];

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
      {children}
    </label>
  );
}

function passwordError(password: string): string | null {
  if (!password) return "Password is required";
  if (password.length < 8 || password.length > 100) {
    return "Password must be 8 to 100 characters";
  }
  if (/\s/.test(password)) return "Password must not contain spaces";
  if (!/[A-Z]/.test(password)) return "Password must contain an uppercase letter";
  if (!/[a-z]/.test(password)) return "Password must contain a lowercase letter";
  if (!/\d/.test(password)) return "Password must contain a number";
  if (!/[^A-Za-z0-9]/.test(password)) return "Password must contain a symbol";
  return null;
}

function fileExtension(file: File): string {
  return file.name.split(".").pop()?.toLowerCase() || "";
}

function validateForm(form: CreateForm, cvFile: File | null, photoFile: File | null): string | null {
  if (!form.firstName.trim()) return "First name is required";
  if (!form.lastName.trim()) return "Last name is required";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) return "Enter a valid email address";

  const passwordMessage = passwordError(form.password);
  if (passwordMessage) return passwordMessage;
  if (form.password !== form.confirmPassword) return "Password and confirm password do not match";

  if (!form.phoneNumber.trim()) return "Phone number is required";
  if (form.city.trim() && !/^[A-Za-z\s]+$/.test(form.city.trim())) {
    return "City must be a valid city name, not a number";
  }
  if (!form.city.trim()) return "City is required";
  if (!form.state) return "State is required";
  if (!form.occupationId) return "Occupation is required";
  if (form.eligibilityToWorkInUS !== "true" && form.eligibilityToWorkInUS !== "false") {
    return "Eligibility to work in the US is required";
  }
  if (!form.agreeToTermsAndConditions) return "Terms and conditions must be accepted";

  if (!cvFile) return "CV file is required";
  const cvExtension = fileExtension(cvFile);
  if (!["pdf", "doc", "docx"].includes(cvExtension)) {
    return "CV must be a PDF, DOC, or DOCX file";
  }
  if (cvFile.size > 2 * 1024 * 1024) return "CV file size exceeds the 2MB limit";

  if (photoFile) {
    const photoExtension = fileExtension(photoFile);
    if (!["jpg", "jpeg", "png"].includes(photoExtension)) {
      return "Profile picture must be a JPG, JPEG, or PNG file";
    }
    if (photoFile.size > 5 * 1024 * 1024) return "Profile picture size exceeds the 5MB limit";
  }

  return null;
}

function appendFlag(formData: FormData, key: string, value: boolean) {
  formData.append(key, value ? "true" : "false");
}

export function CreateJobSeekerModal({ isOpen, onClose }: CreateJobSeekerModalProps) {
  const [form, setForm] = useState<CreateForm>(emptyForm);
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const createJobSeeker = useCreateJobSeeker();
  const { data: statesData } = useStates();
  const { data: occupationsData } = useOccupationsWithSpecialties();
  const { data: degreesData } = useDegrees();

  useEffect(() => {
    if (!isOpen) {
      setForm(emptyForm());
      setCvFile(null);
      setPhotoFile(null);
      setError(null);
    }
  }, [isOpen]);

  const stateOptions = useMemo(() => {
    if (statesData?.success && statesData.data) {
      return statesData.data.states.map((state) => ({
        value: state.abbreviation,
        label: state.name,
      }));
    }
    return [];
  }, [statesData]);

  const degreeOptions = useMemo(() => {
    const degrees = degreesData?.success ? degreesData.data : [];
    return [
      { value: "", label: "Select degree" },
      ...[...degrees]
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((degree) => ({ value: degree.name, label: degree.name })),
    ];
  }, [degreesData]);

  const occupationOptions = useMemo(
    () => [
      { value: "", label: "Select occupation" },
      ...(occupationsData?.success && occupationsData.data
        ? occupationsData.data.map((occupation) => ({
            value: occupation.id.toString(),
            label: occupation.name,
          }))
        : []),
    ],
    [occupationsData],
  );

  const specialtyOptions = useMemo(() => {
    if (!form.occupationId || !occupationsData?.success || !occupationsData.data) {
      return [];
    }
    const selectedOccupation = occupationsData.data.find(
      (occupation) => occupation.id === parseInt(form.occupationId, 10),
    );
    if (!selectedOccupation?.specialty) return [];
    return selectedOccupation.specialty.map((specialty) => ({
      value: specialty.id.toString(),
      text: specialty.name,
      selected: form.specialtyIds.includes(specialty.id.toString()),
    }));
  }, [form.occupationId, form.specialtyIds, occupationsData]);

  const setField = <K extends keyof CreateForm>(key: K, value: CreateForm[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleClose = () => {
    if (createJobSeeker.isPending) return;
    onClose();
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (createJobSeeker.isPending) return;
    const validationError = validateForm(form, cvFile, photoFile);
    if (validationError) {
      setError(validationError);
      return;
    }
    if (!cvFile) return;

    const body = new FormData();
    body.append("firstName", form.firstName.trim());
    body.append("lastName", form.lastName.trim());
    body.append("email", form.email.trim());
    body.append("password", form.password);
    body.append("confirmPassword", form.confirmPassword);
    body.append("phoneNumber", form.phoneNumber.trim());
    if (form.address.trim()) body.append("address", form.address.trim());
    body.append("city", form.city.trim());
    body.append("state", form.state);
    if (form.zipCode.trim()) body.append("zipCode", form.zipCode.trim());
    body.append("country", "US");
    body.append("occupationId", form.occupationId);
    if (form.specialtyIds.length > 0) {
      body.append("specialtyIds", form.specialtyIds.join(","));
    }
    if (form.degree.trim()) body.append("degree", form.degree.trim());
    body.append("eligibilityToWorkInUS", form.eligibilityToWorkInUS);
    appendFlag(body, "requireVisaSponsorship", form.requireVisaSponsorship);
    appendFlag(body, "enableSMSJobAlerts", form.enableSMSJobAlerts);
    appendFlag(body, "enableSMSMarketing", form.enableSMSMarketing);
    appendFlag(body, "enableEmailNotification", form.enableEmailNotification);
    appendFlag(body, "enableNewsletter", form.enableNewsletter);
    appendFlag(body, "agreeToTermsAndConditions", form.agreeToTermsAndConditions);
    appendFlag(body, "emailVerified", form.emailVerified);
    body.append("uploadCV", cvFile);
    if (photoFile) {
      body.append("uploadProfilePic", photoFile);
    }

    setError(null);
    try {
      await createJobSeeker.mutateAsync(body);
      showToast.success(
        "Job seeker created",
        form.emailVerified
          ? `${form.email.trim()} can sign in. The phone number is unverified.`
          : `${form.email.trim()} must verify their email before signing in. The phone number is unverified.`,
      );
      onClose();
    } catch (submitError) {
      const message =
        submitError instanceof Error ? submitError.message : "Could not create the job seeker account";
      setError(message);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      isFullscreen={false}
      className="max-w-3xl mx-auto rounded-lg shadow-xl max-h-[90vh] overflow-hidden"
    >
      <form className="flex flex-col max-h-[90vh]" onSubmit={handleSubmit}>
        <div className="p-6 pb-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Create job seeker</h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            The phone number is always saved as unverified.
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <FieldLabel>First name</FieldLabel>
              <Input
                value={form.firstName}
                onChange={(event) => setField("firstName", event.target.value)}
                placeholder="First name"
              />
            </div>
            <div>
              <FieldLabel>Last name</FieldLabel>
              <Input
                value={form.lastName}
                onChange={(event) => setField("lastName", event.target.value)}
                placeholder="Last name"
              />
            </div>
            <div>
              <FieldLabel>Email</FieldLabel>
              <Input
                type="email"
                value={form.email}
                onChange={(event) => setField("email", event.target.value)}
                placeholder="name@example.com"
              />
            </div>
            <div>
              <FieldLabel>Phone</FieldLabel>
              <Input
                value={form.phoneNumber}
                onChange={(event) => setField("phoneNumber", event.target.value)}
                placeholder="Phone number"
              />
              <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                Saved as unverified. There is no option to mark it verified.
              </p>
            </div>
            <div>
              <FieldLabel>Password</FieldLabel>
              <Input
                type="password"
                value={form.password}
                onChange={(event) => setField("password", event.target.value)}
                placeholder="Set a password"
                autoComplete="new-password"
              />
            </div>
            <div>
              <FieldLabel>Confirm password</FieldLabel>
              <Input
                type="password"
                value={form.confirmPassword}
                onChange={(event) => setField("confirmPassword", event.target.value)}
                placeholder="Confirm password"
                autoComplete="new-password"
              />
            </div>
            <div className="sm:col-span-2">
              <FieldLabel>Address (optional)</FieldLabel>
              <Input
                value={form.address}
                onChange={(event) => setField("address", event.target.value)}
                placeholder="Street address"
              />
            </div>
            <div>
              <FieldLabel>City</FieldLabel>
              <Input
                value={form.city}
                onChange={(event) => setField("city", event.target.value)}
                placeholder="City"
              />
            </div>
            <div>
              <FieldLabel>State</FieldLabel>
              <Select
                options={stateOptions}
                value={form.state}
                onChange={(value) => setField("state", value)}
                placeholder="Select state"
                searchable
              />
            </div>
            <div>
              <FieldLabel>Zip code (optional)</FieldLabel>
              <Input
                value={form.zipCode}
                onChange={(event) => setField("zipCode", event.target.value)}
                placeholder="Zip code"
              />
            </div>
            <div>
              <FieldLabel>Country</FieldLabel>
              <Input value="United States" disabled readOnly />
            </div>
            <div>
              <FieldLabel>Occupation</FieldLabel>
              <Select
                options={occupationOptions}
                value={form.occupationId}
                onChange={(value) => {
                  setForm((current) => ({
                    ...current,
                    occupationId: value,
                    specialtyIds: [],
                  }));
                }}
                placeholder="Select occupation"
                searchable
              />
            </div>
            <div>
              <FieldLabel>Degree (optional)</FieldLabel>
              <Select
                options={degreeOptions}
                value={form.degree}
                onChange={(value) => setField("degree", value)}
                placeholder="Select degree"
                searchable
              />
            </div>
            <div className="sm:col-span-2">
              <MultiSelect
                label="Specialties (optional)"
                options={specialtyOptions}
                value={form.specialtyIds}
                onChange={(selected) => setField("specialtyIds", selected)}
                placeholder={form.occupationId ? "Select specialties" : "Select an occupation first"}
                disabled={!form.occupationId}
              />
            </div>
            <div>
              <FieldLabel>Eligible to work in the US</FieldLabel>
              <Select
                options={eligibilityOptions}
                value={form.eligibilityToWorkInUS}
                onChange={(value) => setField("eligibilityToWorkInUS", value)}
                placeholder="Select"
              />
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <Checkbox
              id="create-job-seeker-visa"
              label="Requires visa sponsorship"
              checked={form.requireVisaSponsorship}
              onChange={(checked) => setField("requireVisaSponsorship", checked)}
            />
            <Checkbox
              id="create-job-seeker-sms-alerts"
              label="SMS job alerts"
              checked={form.enableSMSJobAlerts}
              onChange={(checked) => setField("enableSMSJobAlerts", checked)}
            />
            <Checkbox
              id="create-job-seeker-sms-marketing"
              label="SMS marketing"
              checked={form.enableSMSMarketing}
              onChange={(checked) => setField("enableSMSMarketing", checked)}
            />
            <Checkbox
              id="create-job-seeker-email-notification"
              label="Email notifications"
              checked={form.enableEmailNotification}
              onChange={(checked) => setField("enableEmailNotification", checked)}
            />
            <Checkbox
              id="create-job-seeker-newsletter"
              label="Newsletter"
              checked={form.enableNewsletter}
              onChange={(checked) => setField("enableNewsletter", checked)}
            />
            <Checkbox
              id="create-job-seeker-terms"
              label="Agrees to the terms and conditions and privacy policy"
              checked={form.agreeToTermsAndConditions}
              onChange={(checked) => setField("agreeToTermsAndConditions", checked)}
            />
            <Checkbox
              id="create-job-seeker-email-verified"
              label="Email is already verified"
              checked={form.emailVerified}
              onChange={(checked) => setField("emailVerified", checked)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <FieldLabel>Resume (PDF, DOC, or DOCX, up to 2MB)</FieldLabel>
              <input
                type="file"
                accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                onChange={(event) => setCvFile(event.target.files?.[0] ?? null)}
                className="block w-full text-sm text-gray-700 file:mr-3 file:rounded-lg file:border-0 file:bg-gray-100 file:px-3 file:py-2 file:text-sm file:font-medium dark:text-gray-300 dark:file:bg-gray-800"
              />
              {cvFile && <p className="mt-1.5 text-xs text-gray-500">{cvFile.name}</p>}
            </div>
            <div>
              <FieldLabel>Profile photo (optional, JPG or PNG, up to 5MB)</FieldLabel>
              <input
                type="file"
                accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                onChange={(event) => setPhotoFile(event.target.files?.[0] ?? null)}
                className="block w-full text-sm text-gray-700 file:mr-3 file:rounded-lg file:border-0 file:bg-gray-100 file:px-3 file:py-2 file:text-sm file:font-medium dark:text-gray-300 dark:file:bg-gray-800"
              />
              {photoFile && <p className="mt-1.5 text-xs text-gray-500">{photoFile.name}</p>}
            </div>
          </div>
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
            <Button type="button" variant="ghost" onClick={handleClose} disabled={createJobSeeker.isPending}>
              Cancel
            </Button>
            <Button type="submit" variant="default" disabled={createJobSeeker.isPending}>
              {createJobSeeker.isPending ? "Creating..." : "Create account"}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
