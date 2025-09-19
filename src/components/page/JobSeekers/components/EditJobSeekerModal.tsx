import React, { useState, useEffect, useCallback } from "react";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import Input from "@/components/ui/input/Input";
import Select from "@/components/form/Select";
import { jobSeekerApi } from "@/services/api/jobSeeker";
import { JobSeekerUpdateData } from "@/services/types/jobSeeker";
import { useStates } from "@/services/hooks/useStates";
import { useOccupationsWithSpecialties } from "@/services/hooks/useJobCreation";

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

  // Profile picture states
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [currentProfilePicture, setCurrentProfilePicture] = useState<{
    fileName: string;
    url: string;
    expiresAt: string;
  } | null>(null);

  const { data: statesData, isLoading: isStatesLoading } = useStates();
  const { data: occupationsData, isLoading: isOccupationsLoading } = useOccupationsWithSpecialties();

  const stateOptions = [
    { value: "", label: "Select state" },
    ...(statesData?.success && statesData.data
      ? statesData.data.states.map((state) => ({
          value: state.abbreviation,
          label: state.name,
        }))
      : []),
  ];

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
        const firstName = nameParts[0] || "";
        const lastName = nameParts.slice(1).join(" ") || "";

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
    if (isOpen && jobSeekerId && statesData?.success && occupationsData?.success) {
      setError(null); // Clear any previous errors
      loadJobSeekerData();
    }
  }, [isOpen, jobSeekerId, loadJobSeekerData, statesData, occupationsData]);

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
    return (
      formData.firstName.trim() && formData.lastName.trim() && formData.occupationId && formData.occupationId !== 0
    );
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
