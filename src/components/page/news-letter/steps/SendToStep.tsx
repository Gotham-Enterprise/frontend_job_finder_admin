import React, { useState, useMemo } from "react";
import { useNewsletter } from "../NewsletterContext";

// Sample data for Job Seekers
const jobSeekers = [
  { email: "jobseeker1@example.com", name: "John Doe" },
  { email: "jobseeker2@example.com", name: "Jane Smith" },
  { email: "jobseeker3@example.com", name: "Mike Johnson" },
  { email: "jobseeker4@example.com", name: "Sarah Williams" },
  { email: "jobseeker5@example.com", name: "David Brown" },
];

// Sample data for Employers
const employers = [
  { email: "employer1@example.com", name: "Tech Corp" },
  { email: "employer2@example.com", name: "Business Solutions Inc" },
  { email: "employer3@example.com", name: "Creative Agency" },
  { email: "employer4@example.com", name: "Global Industries" },
  { email: "employer5@example.com", name: "Startup Ventures" },
];

const SendToStep: React.FC = () => {
  const { goToStep, completeStep, updateNewsletterData } = useNewsletter();
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>([]);
  const [selectAllJobSeekers, setSelectAllJobSeekers] = useState(false);
  const [selectAllEmployers, setSelectAllEmployers] = useState(false);

  // Handle individual email selection
  const handleEmailToggle = (email: string) => {
    setSelectedRecipients((prev) => {
      if (prev.includes(email)) {
        return prev.filter((e) => e !== email);
      } else {
        return [...prev, email];
      }
    });
  };

  // Handle "Select All Job Seekers"
  const handleSelectAllJobSeekers = () => {
    const newValue = !selectAllJobSeekers;
    setSelectAllJobSeekers(newValue);

    if (newValue) {
      // Remove individual job seeker emails and add "jobSeeker" group
      const withoutJobSeekers = selectedRecipients.filter((email) => !jobSeekers.some((js) => js.email === email));
      setSelectedRecipients([...withoutJobSeekers, "jobSeeker"]);
    } else {
      // Remove "jobSeeker" group
      setSelectedRecipients((prev) => prev.filter((email) => email !== "jobSeeker"));
    }
  };

  // Handle "Select All Employers"
  const handleSelectAllEmployers = () => {
    const newValue = !selectAllEmployers;
    setSelectAllEmployers(newValue);

    if (newValue) {
      // Remove individual employer emails and add "employer" group
      const withoutEmployers = selectedRecipients.filter((email) => !employers.some((emp) => emp.email === email));
      setSelectedRecipients([...withoutEmployers, "employer"]);
    } else {
      // Remove "employer" group
      setSelectedRecipients((prev) => prev.filter((email) => email !== "employer"));
    }
  };

  // Check if a job seeker email is selected
  const isJobSeekerSelected = (email: string) => {
    return selectedRecipients.includes("jobSeeker") || selectedRecipients.includes(email);
  };

  // Check if an employer email is selected
  const isEmployerSelected = (email: string) => {
    return selectedRecipients.includes("employer") || selectedRecipients.includes(email);
  };

  // Build the final sendTo array based on selections
  const buildSendToArray = useMemo(() => {
    const result: string[] = [];

    // Add employer group or individual employers
    if (selectAllEmployers) {
      result.push("employer");
    } else {
      const individualEmployers = selectedRecipients.filter((email) => employers.some((emp) => emp.email === email));
      result.push(...individualEmployers);
    }

    // Add jobSeeker group or individual job seekers
    if (selectAllJobSeekers) {
      result.push("jobSeeker");
    } else {
      const individualJobSeekers = selectedRecipients.filter((email) => jobSeekers.some((js) => js.email === email));
      result.push(...individualJobSeekers);
    }

    return result;
  }, [selectedRecipients, selectAllEmployers, selectAllJobSeekers]);

  const handleContinue = () => {
    // Update newsletter data with selected recipients
    updateNewsletterData({
      sendTo: buildSendToArray,
    });
    // Mark current step as completed
    completeStep(4);
    // Go to Schedule step
    goToStep(5);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="text-center mb-8">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-purple-100 mb-4">
            <svg className="h-8 w-8 text-purple-600" fill="#006d36" stroke="#006d36" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Send To</h2>
          <p className="text-gray-600">Select your audience for this newsletter.</p>
        </div>

        <div className="space-y-6">
          {/* Employers Group */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectAllEmployers}
                  onChange={handleSelectAllEmployers}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-3 text-sm font-semibold text-gray-900">Employers (Select All)</span>
              </label>
            </div>
            <div className="px-4 py-2 space-y-2 max-h-48 overflow-y-auto">
              {employers.map((employer) => (
                <label
                  key={employer.email}
                  className="flex items-center cursor-pointer py-2 hover:bg-gray-50 px-2 rounded"
                >
                  <input
                    type="checkbox"
                    checked={isEmployerSelected(employer.email)}
                    onChange={() => handleEmailToggle(employer.email)}
                    disabled={selectAllEmployers}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50"
                  />
                  <span className="ml-3 text-sm text-gray-700">
                    {employer.name} <span className="text-gray-500">({employer.email})</span>
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Job Seekers Group */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectAllJobSeekers}
                  onChange={handleSelectAllJobSeekers}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-3 text-sm font-semibold text-gray-900">Job Seekers (Select All)</span>
              </label>
            </div>
            <div className="px-4 py-2 space-y-2 max-h-48 overflow-y-auto">
              {jobSeekers.map((jobSeeker) => (
                <label
                  key={jobSeeker.email}
                  className="flex items-center cursor-pointer py-2 hover:bg-gray-50 px-2 rounded"
                >
                  <input
                    type="checkbox"
                    checked={isJobSeekerSelected(jobSeeker.email)}
                    onChange={() => handleEmailToggle(jobSeeker.email)}
                    disabled={selectAllJobSeekers}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50"
                  />
                  <span className="ml-3 text-sm text-gray-700">
                    {jobSeeker.name} <span className="text-gray-500">({jobSeeker.email})</span>
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="button"
              onClick={handleContinue}
              disabled={buildSendToArray.length === 0}
              className="px-6 py-2.5 bg-primary text-white font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SendToStep;
