import React, { useState, useMemo, useEffect } from "react";
import { useAppDispatch } from "@/store";
import { setSendToDetails, completeStep, setCurrentStep } from "@/store/slices/newsletterSlice";
import { newsletterApi, NewsletterEmailUser, NewsletterEmailGroup } from "@/services/api/newsLetter";
import { useToast } from "@/context/ToastContext";
import Checkbox from "@/components/form/input/Checkbox";

const SendToStep: React.FC = () => {
  const dispatch = useAppDispatch();
  const { addToast } = useToast();
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>([]);
  const [selectAllJobSeekers, setSelectAllJobSeekers] = useState(false);
  const [selectAllEmployers, setSelectAllEmployers] = useState(false);
  const [jobSeekers, setJobSeekers] = useState<NewsletterEmailUser[]>([]);
  const [employers, setEmployers] = useState<NewsletterEmailUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch email lists on component mount
  useEffect(() => {
    const fetchEmails = async () => {
      try {
        setIsLoading(true);
        const response = await newsletterApi.getNewsletterEmails();

        if (response.success && response.data) {
          const employerGroup = response.data.find((group) => group.role === "employer");
          const jobSeekerGroup = response.data.find((group) => group.role === "job-seeker");

          if (employerGroup) {
            setEmployers(employerGroup.users);
          }
          if (jobSeekerGroup) {
            setJobSeekers(jobSeekerGroup.users);
          }
        }
      } catch (error: any) {
        console.error("Failed to fetch newsletter emails:", error);
        addToast({
          variant: "error",
          title: "Error",
          message: error.message || "Failed to load recipients. Please try again.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchEmails();
  }, [addToast]);

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
    // Update Redux with selected recipients
    dispatch(
      setSendToDetails({
        sendTo: buildSendToArray,
      })
    );
    // Mark current step as completed
    dispatch(completeStep(4));
    // Go to Schedule step
    dispatch(setCurrentStep(5));
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

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Employers Group */}
            <div className="border border-gray-200 rounded-lg overflow-hidden dark:border-gray-700">
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700">
                <div className="flex items-center">
                  <Checkbox checked={selectAllEmployers} onChange={handleSelectAllEmployers} label="" />
                  <span className="ml-3 text-sm font-semibold text-gray-900 dark:text-white">
                    Employers (Select All) - {employers.length} {employers.length === 1 ? "user" : "users"}
                  </span>
                </div>
              </div>
              <div className="px-4 py-2 space-y-2 max-h-48 overflow-y-auto">
                {employers.map((employer) => (
                  <div
                    key={employer.email}
                    className="flex items-center py-2 hover:bg-gray-50 dark:hover:bg-gray-700 px-2 rounded"
                  >
                    <Checkbox
                      checked={isEmployerSelected(employer.email)}
                      onChange={() => handleEmailToggle(employer.email)}
                      disabled={selectAllEmployers}
                      label=""
                    />
                    <span className="ml-3 text-sm text-gray-700 dark:text-gray-300">
                      {employer.name} <span className="text-gray-500 dark:text-gray-400">({employer.email})</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Job Seekers Group */}
            <div className="border border-gray-200 rounded-lg overflow-hidden dark:border-gray-700">
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700">
                <div className="flex items-center">
                  <Checkbox checked={selectAllJobSeekers} onChange={handleSelectAllJobSeekers} label="" />
                  <span className="ml-3 text-sm font-semibold text-gray-900 dark:text-white">
                    Job Seekers (Select All) - {jobSeekers.length} {jobSeekers.length === 1 ? "user" : "users"}
                  </span>
                </div>
              </div>
              <div className="px-4 py-2 space-y-2 max-h-48 overflow-y-auto">
                {jobSeekers.map((jobSeeker) => (
                  <div
                    key={jobSeeker.email}
                    className="flex items-center py-2 hover:bg-gray-50 dark:hover:bg-gray-700 px-2 rounded"
                  >
                    <Checkbox
                      checked={isJobSeekerSelected(jobSeeker.email)}
                      onChange={() => handleEmailToggle(jobSeeker.email)}
                      disabled={selectAllJobSeekers}
                      label=""
                    />
                    <span className="ml-3 text-sm text-gray-700 dark:text-gray-300">
                      {jobSeeker.name} <span className="text-gray-500 dark:text-gray-400">({jobSeeker.email})</span>
                    </span>
                  </div>
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
        )}
      </div>
    </div>
  );
};

export default SendToStep;
