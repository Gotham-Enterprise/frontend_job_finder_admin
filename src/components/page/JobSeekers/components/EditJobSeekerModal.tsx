import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import Input from "@/components/ui/input/Input";
import Select from "@/components/form/Select";
import { jobSeekerApi } from "@/services/api/jobSeeker";
import { useStates } from "@/services/hooks/useStates";
import { useJobsAdminOccupations } from "@/services/hooks/useJobsAdmin";
import { JobSeekerUpdateData, JobSeekerDetails } from "@/services/types/jobSeeker";
import { Specialty } from "@/services/types/jobsAdmin";

interface EditJobSeekerModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobSeekerId: string;
  onUpdate: () => void;
}

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
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedOccupationId, setSelectedOccupationId] = useState<number | undefined>(undefined);

  // Profile picture states
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [currentProfilePicture, setCurrentProfilePicture] = useState<{
    fileName: string;
    url: string;
    expiresAt: string;
  } | null>(null);

  const { data: statesData, isLoading: isStatesLoading } = useStates();
  const { data: occupationsData, isLoading: isOccupationsLoading } = useJobsAdminOccupations();

  // Helper function to normalize state value (convert name to abbreviation if needed)
  const normalizeStateValue = useCallback(
    (stateValue: string) => {
      if (!stateValue || !statesData?.success || !statesData.data) {
        return stateValue;
      }

      // First try to find by abbreviation (exact match)
      const stateByAbbr = statesData.data.states.find(
        (state) => state.abbreviation.toLowerCase() === stateValue.toLowerCase()
      );
      if (stateByAbbr) {
        return stateByAbbr.abbreviation;
      }

      // If not found by abbreviation, try to find by name
      const stateByName = statesData.data.states.find((state) => state.name.toLowerCase() === stateValue.toLowerCase());
      if (stateByName) {
        return stateByName.abbreviation;
      }

      // Return original value if no match found
      return stateValue;
    },
    [statesData]
  );

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

  const stateOptions = React.useMemo(() => {
    if (statesData?.success && statesData.data) {
      return statesData.data.states.map((state) => ({
        value: state.abbreviation,
        label: state.name,
      }));
    }
    return [];
  }, [statesData]);

  const occupationOptions = useMemo(() => {
    if (occupationsData?.success && occupationsData.data) {
      // Create a Map to deduplicate by name (keep first occurrence)
      const uniqueOccupations = new Map();

      occupationsData.data.forEach((occupation) => {
        // Filter out any placeholder-like entries and empty names
        const name = occupation.name?.trim();
        if (name && !name.toLowerCase().includes("select") && !uniqueOccupations.has(name)) {
          uniqueOccupations.set(name, {
            value: occupation.id.toString(),
            label: name,
          });
        }
      });

      return Array.from(uniqueOccupations.values()).sort((a, b) => a.label.localeCompare(b.label));
    }

    return [];
  }, [occupationsData]);

  const specialtyOptions = useMemo(() => {
    if (selectedOccupationId && occupationsData?.success && occupationsData.data) {
      const selectedOccupation = occupationsData.data.find((occupation) => occupation.id === selectedOccupationId);

      if (selectedOccupation?.specialty) {
        // Create a Map to deduplicate by name (keep first occurrence)
        const uniqueSpecialties = new Map();

        selectedOccupation.specialty.forEach((specialty: Specialty) => {
          if (!uniqueSpecialties.has(specialty.name)) {
            uniqueSpecialties.set(specialty.name, {
              value: specialty.id.toString(),
              label: specialty.name,
            });
          }
        });

        return Array.from(uniqueSpecialties.values()).sort((a, b) => a.label.localeCompare(b.label));
      }
    }

    return [];
  }, [selectedOccupationId, occupationsData]);

  const countryOptions = React.useMemo(
    () => [
      { value: "US", label: "United States" },
      { value: "CA", label: "Canada" },
      { value: "GB", label: "United Kingdom" },
      { value: "AU", label: "Australia" },
      { value: "DE", label: "Germany" },
      { value: "FR", label: "France" },
      { value: "MX", label: "Mexico" },
      { value: "OTHER", label: "Other" },
    ],
    []
  );

  const loadJobSeekerData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await jobSeekerApi.getJobSeekerById(jobSeekerId);
      if (response.success && response.data) {
        const jobSeeker = response.data;
        const nameParts = jobSeeker.name?.split(" ") || ["", ""];
        const normalizedState = normalizeStateValue(jobSeeker.state || "");

        setFormData({
          firstName: nameParts[0] || "",
          lastName: nameParts.slice(1).join(" ") || "",
          address: jobSeeker.address || "",
          city: jobSeeker.city || "",
          state: normalizedState,
          country: "US",
          zipCode: jobSeeker.zipCode || "",
          phoneNumber: jobSeeker.phoneNumber || "",
          occupationId: jobSeeker.occupationId || 0,
          specialtyId: jobSeeker.specialtyId,
        });
        setSelectedOccupationId(jobSeeker.occupationId);

        // Set current profile picture if exists
        if (jobSeeker.profilePicture && jobSeeker.profilePicture.url) {
          setCurrentProfilePicture(jobSeeker.profilePicture);
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
  }, [jobSeekerId, normalizeStateValue]);

  useEffect(() => {
    if (isOpen && jobSeekerId) {
      loadJobSeekerData();
    }
  }, [isOpen, jobSeekerId, loadJobSeekerData]);

  // Re-normalize state value when states data becomes available
  useEffect(() => {
    if (statesData?.success && formData.state) {
      const normalizedState = normalizeStateValue(formData.state);
      if (normalizedState !== formData.state) {
        setFormData((prev) => ({
          ...prev,
          state: normalizedState,
        }));
      }
    }
  }, [statesData?.success, formData.state, normalizeStateValue]);

  const updateField = (field: keyof JobSeekerUpdateData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Handle occupation change to reset specialty
    if (field === "occupationId") {
      const occupationId = value ? parseInt(value) : 0;
      setSelectedOccupationId(occupationId);
      setFormData((prev) => ({
        ...prev,
        occupationId,
        specialtyId: undefined, // Reset specialty when occupation changes
      }));
    }

    // Handle specialty change
    if (field === "specialtyId") {
      setFormData((prev) => ({
        ...prev,
        specialtyId: value ? parseInt(value) : undefined,
      }));
    }
  };

  const saveChanges = async () => {
    setIsSaving(true);
    setError(null);
    try {
      // Create form data with file if selected
      const updateData = { ...formData };
      if (selectedFile) {
        updateData.uploadProfilePicture = selectedFile;
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
    return formData.firstName.trim() && formData.lastName.trim() && formData.occupationId > 0;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      isFullscreen={false}
      className="max-w-2xl mx-auto mt-8 mb-8 rounded-lg shadow-xl max-h-[90vh] overflow-hidden"
    >
      <div className="flex flex-col max-h-[90vh]">
        <div className="p-6 pb-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Edit Job Seeker</h2>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

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
                    htmlFor="profile-picture-upload"
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
                  id="profile-picture-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>

              {/* Error message for file upload */}
              {error && error.includes("image") && (
                <div className="text-center">
                  <span className="text-sm text-red-600 dark:text-red-400">{error}</span>
                </div>
              )}

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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Occupation *
                  </label>
                  <Select
                    options={occupationOptions}
                    value={formData.occupationId > 0 ? formData.occupationId.toString() : ""}
                    onChange={(value) => updateField("occupationId", value)}
                    placeholder="Select Occupation"
                    disabled={isOccupationsLoading}
                    searchable={true}
                    searchPlaceholder="Search occupations..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Specialty</label>
                  <Select
                    options={specialtyOptions}
                    value={formData.specialtyId ? formData.specialtyId.toString() : ""}
                    onChange={(value) => updateField("specialtyId", value)}
                    placeholder="Select Specialty"
                    disabled={!selectedOccupationId || selectedOccupationId === 0 || isOccupationsLoading}
                    searchable={true}
                    searchPlaceholder="Search specialties..."
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
                    value={formData.state}
                    onChange={(value) => updateField("state", value)}
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
                    onChange={(value) => updateField("country", value)}
                    placeholder="Select country"
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
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 p-6 pt-4 border-t border-gray-200 dark:border-gray-700">
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
    </Modal>
  );
};
