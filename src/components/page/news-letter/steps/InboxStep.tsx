import React, { useState } from "react";
import { useNewsletter } from "../NewsletterContext";

const InboxStep: React.FC = () => {
  const { goToStep, completeStep, updateNewsletterData } = useNewsletter();
  const [formData, setFormData] = useState({
    subject: "",
    fromName: "",
    fromAddress: "",
  });

  const [errors, setErrors] = useState({
    subject: "",
    fromName: "",
    fromAddress: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {
      subject: "",
      fromName: "",
      fromAddress: "",
    };
    let isValid = true;

    if (!formData.subject.trim()) {
      newErrors.subject = "Subject line is required";
      isValid = false;
    }

    if (!formData.fromName.trim()) {
      newErrors.fromName = "From name is required";
      isValid = false;
    }

    if (!formData.fromAddress.trim()) {
      newErrors.fromAddress = "From address is required";
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.fromAddress)) {
      newErrors.fromAddress = "Please enter a valid email address";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleContinue = () => {
    if (validateForm()) {
      // Update newsletter data with form values
      updateNewsletterData({
        subject: formData.subject,
        fromName: formData.fromName,
        fromAddress: formData.fromAddress,
      });
      // Mark current step as completed
      completeStep(3);
      // Go to Send To step
      goToStep(4);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="text-center mb-8">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
            <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Inbox</h2>
          <p className="text-gray-600">
            Preview how your newsletter will appear in recipients' inboxes and test delivery.
          </p>
        </div>

        <div className="space-y-6">
          {/* Subject Line */}
          <div>
            <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
              Subject line <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="subject"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                errors.subject
                  ? "border-red-300 focus:ring-red-200 focus:border-red-500"
                  : "border-gray-300 focus:ring-blue-200 focus:border-blue-500"
              }`}
              placeholder="Enter email subject line"
            />
            {errors.subject && <p className="mt-1 text-sm text-red-600">{errors.subject}</p>}
          </div>

          {/* From Name */}
          <div>
            <label htmlFor="fromName" className="block text-sm font-medium text-gray-700 mb-2">
              From name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="fromName"
              name="fromName"
              value={formData.fromName}
              onChange={handleChange}
              className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                errors.fromName
                  ? "border-red-300 focus:ring-red-200 focus:border-red-500"
                  : "border-gray-300 focus:ring-blue-200 focus:border-blue-500"
              }`}
              placeholder="Enter sender name"
            />
            {errors.fromName && <p className="mt-1 text-sm text-red-600">{errors.fromName}</p>}
          </div>

          {/* From Address */}
          <div>
            <label htmlFor="fromAddress" className="block text-sm font-medium text-gray-700 mb-2">
              From address <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              id="fromAddress"
              name="fromAddress"
              value={formData.fromAddress}
              onChange={handleChange}
              className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                errors.fromAddress
                  ? "border-red-300 focus:ring-red-200 focus:border-red-500"
                  : "border-gray-300 focus:ring-blue-200 focus:border-blue-500"
              }`}
              placeholder="sender@example.com"
            />
            {errors.fromAddress && <p className="mt-1 text-sm text-red-600">{errors.fromAddress}</p>}
          </div>

          {/* Continue Button */}
          <div className="flex justify-end pt-4">
            <button
              type="button"
              onClick={handleContinue}
              className="px-6 py-2.5 bg-primary text-white font-medium rounded-lg"
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InboxStep;
