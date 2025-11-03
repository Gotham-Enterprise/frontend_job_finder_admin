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

  // Search states for filtering
  const [employerSearch, setEmployerSearch] = useState("");
  const [jobSeekerSearch, setJobSeekerSearch] = useState("");

  // Expanded states to show/hide lists
  const [employersExpanded, setEmployersExpanded] = useState(false);
  const [jobSeekersExpanded, setJobSeekersExpanded] = useState(false);

  // Pagination states - render only subset at a time
  const [employerDisplayLimit, setEmployerDisplayLimit] = useState(50);
  const [jobSeekerDisplayLimit, setJobSeekerDisplayLimit] = useState(50);
  const LOAD_MORE_INCREMENT = 50;

  // Reset display limits when search changes
  useEffect(() => {
    setEmployerDisplayLimit(50);
  }, [employerSearch]);

  useEffect(() => {
    setJobSeekerDisplayLimit(50);
  }, [jobSeekerSearch]);

  // Reset display limits when collapsing
  useEffect(() => {
    if (!employersExpanded) {
      setEmployerDisplayLimit(50);
    }
  }, [employersExpanded]);

  useEffect(() => {
    if (!jobSeekersExpanded) {
      setJobSeekerDisplayLimit(50);
    }
  }, [jobSeekersExpanded]);

  // Fetch email lists on component mount
  useEffect(() => {
    let isMounted = true;
    const fetchEmails = async () => {
      try {
        setIsLoading(true);
        const response = await newsletterApi.getNewsletterEmails();

        if (isMounted && response.success && response.data) {
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
        // Only show toast if component is still mounted
        if (isMounted) {
          addToast({
            variant: "error",
            title: "Error",
            message: error.message || "Failed to load recipients. Please try again.",
          });
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchEmails();

    return () => {
      isMounted = false;
    };
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

  // Filtered lists based on search
  const filteredEmployers = useMemo(() => {
    if (!employerSearch.trim()) return employers;
    const search = employerSearch.toLowerCase();
    return employers.filter(
      (emp) => emp.name.toLowerCase().includes(search) || emp.email.toLowerCase().includes(search)
    );
  }, [employers, employerSearch]);

  const filteredJobSeekers = useMemo(() => {
    if (!jobSeekerSearch.trim()) return jobSeekers;
    const search = jobSeekerSearch.toLowerCase();
    return jobSeekers.filter((js) => js.name.toLowerCase().includes(search) || js.email.toLowerCase().includes(search));
  }, [jobSeekers, jobSeekerSearch]);

  // Limited display lists (only render subset for performance)
  const displayedEmployers = useMemo(() => {
    return filteredEmployers.slice(0, employerDisplayLimit);
  }, [filteredEmployers, employerDisplayLimit]);

  const displayedJobSeekers = useMemo(() => {
    return filteredJobSeekers.slice(0, jobSeekerDisplayLimit);
  }, [filteredJobSeekers, jobSeekerDisplayLimit]);

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
  }, [selectedRecipients, selectAllEmployers, selectAllJobSeekers, employers, jobSeekers]);

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
              <div className="bg-gray-50 px-4 py-3 dark:bg-gray-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center flex-1">
                    <Checkbox checked={selectAllEmployers} onChange={handleSelectAllEmployers} label="" />
                    <span className="ml-3 text-sm font-semibold text-gray-900 dark:text-white">
                      Employers (Select All) - {employers.length} {employers.length === 1 ? "user" : "users"}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEmployersExpanded(!employersExpanded)}
                    className="ml-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    <svg
                      className={`h-5 w-5 transform transition-transform ${employersExpanded ? "rotate-180" : ""}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>

                {/* Search box - only show when expanded */}
                {employersExpanded && !selectAllEmployers && (
                  <div className="mt-3">
                    <input
                      type="text"
                      placeholder="Search employers..."
                      value={employerSearch}
                      onChange={(e) => setEmployerSearch(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                )}
              </div>

              {/* Only render list when expanded */}
              {employersExpanded && (
                <div className="px-4 py-2 space-y-2 max-h-64 overflow-y-auto">
                  {filteredEmployers.length === 0 ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400 py-4 text-center">
                      {employerSearch ? "No employers found matching your search" : "No employers available"}
                    </p>
                  ) : (
                    <>
                      {displayedEmployers.map((employer) => (
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

                      {/* Load More button */}
                      {displayedEmployers.length < filteredEmployers.length && (
                        <button
                          type="button"
                          onClick={() => setEmployerDisplayLimit((prev) => prev + LOAD_MORE_INCREMENT)}
                          className="w-full py-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg font-medium"
                        >
                          Load More ({filteredEmployers.length - displayedEmployers.length} remaining)
                        </button>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Job Seekers Group */}
            <div className="border border-gray-200 rounded-lg overflow-hidden dark:border-gray-700">
              <div className="bg-gray-50 px-4 py-3 dark:bg-gray-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center flex-1">
                    <Checkbox checked={selectAllJobSeekers} onChange={handleSelectAllJobSeekers} label="" />
                    <span className="ml-3 text-sm font-semibold text-gray-900 dark:text-white">
                      Job Seekers (Select All) - {jobSeekers.length} {jobSeekers.length === 1 ? "user" : "users"}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setJobSeekersExpanded(!jobSeekersExpanded)}
                    className="ml-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    <svg
                      className={`h-5 w-5 transform transition-transform ${jobSeekersExpanded ? "rotate-180" : ""}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>

                {/* Search box - only show when expanded */}
                {jobSeekersExpanded && !selectAllJobSeekers && (
                  <div className="mt-3">
                    <input
                      type="text"
                      placeholder="Search job seekers..."
                      value={jobSeekerSearch}
                      onChange={(e) => setJobSeekerSearch(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                )}
              </div>

              {/* Only render list when expanded */}
              {jobSeekersExpanded && (
                <div className="px-4 py-2 space-y-2 max-h-64 overflow-y-auto">
                  {filteredJobSeekers.length === 0 ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400 py-4 text-center">
                      {jobSeekerSearch ? "No job seekers found matching your search" : "No job seekers available"}
                    </p>
                  ) : (
                    <>
                      {displayedJobSeekers.map((jobSeeker) => (
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
                            {jobSeeker.name}{" "}
                            <span className="text-gray-500 dark:text-gray-400">({jobSeeker.email})</span>
                          </span>
                        </div>
                      ))}

                      {/* Load More button */}
                      {displayedJobSeekers.length < filteredJobSeekers.length && (
                        <button
                          type="button"
                          onClick={() => setJobSeekerDisplayLimit((prev) => prev + LOAD_MORE_INCREMENT)}
                          className="w-full py-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg font-medium"
                        >
                          Load More ({filteredJobSeekers.length - displayedJobSeekers.length} remaining)
                        </button>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Selection Summary */}
            {buildSendToArray.length > 0 && (
              <div className="bg-primary border  rounded-lg p-4">
                <div className="flex items-start">
                  <svg className="h-5 w-5 text-white mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <div className="ml-3 flex-1">
                    <h3 className="text-sm font-medium text-white">Selected Recipients</h3>
                    <div className="mt-2 text-sm text-white">
                      {selectAllEmployers && <p>✓ All Employers ({employers.length} users)</p>}
                      {selectAllJobSeekers && <p>✓ All Job Seekers ({jobSeekers.length} users)</p>}
                      {!selectAllEmployers && !selectAllJobSeekers && (
                        <p>✓ {buildSendToArray.length} individual recipient(s) selected</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end pt-4">
              <button
                type="button"
                onClick={handleContinue}
                disabled={buildSendToArray.length === 0}
                className="px-6 py-2.5 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
