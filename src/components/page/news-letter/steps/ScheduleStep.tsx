import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store";
import { setScheduleDetails, setSubmitting, setError } from "@/store/slices/newsletterSlice";
import { createNewsletter } from "@/services/api/newsletterService";
import { useToast } from "@/context/ToastContext";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const ScheduleStep: React.FC = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { addToast } = useToast();
  const newsletterData = useAppSelector((state) => state.newsletter.data);
  const isSubmitting = useAppSelector((state) => state.newsletter.isSubmitting);

  const [sendOption, setSendOption] = useState<"now" | "later">("later");
  const [scheduledDate, setScheduledDate] = useState<Date>(new Date());
  const [scheduledTime, setScheduledTime] = useState("");
  const [saveAsTemplate, setSaveAsTemplate] = useState(false);

  useEffect(() => {
    const now = new Date();
    const timeStr = now.toTimeString().slice(0, 5);
    setScheduledTime(timeStr);
  }, []);

  const getTodayDate = () => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return now;
  };

  const submitNewsletter = async () => {
    let status: "DRAFT" | "SCHEDULED" | "SENT" = "DRAFT";
    let scheduledAt: string | undefined = undefined;
    const scheduledTimezone = "America/New_York";

    if (sendOption === "now") {
      status = "SENT";
    } else {
      status = "SCHEDULED";
      const [hours, minutes] = scheduledTime.split(":");
      const dateObj = new Date(scheduledDate);
      dateObj.setHours(parseInt(hours), parseInt(minutes), 0);
      scheduledAt = dateObj.toISOString();
    }

    // Update Redux state with schedule details
    dispatch(
      setScheduleDetails({
        status,
        scheduledAt,
        scheduledTimezone,
        isTemplate: saveAsTemplate,
      })
    );

    // Now submit to API
    try {
      dispatch(setSubmitting(true));
      dispatch(setError(null));

      const finalPayload = {
        ...newsletterData,
        status,
        scheduledAt,
        scheduledTimezone,
        isTemplate: saveAsTemplate,
      };

      console.log("Submitting Newsletter to API:", finalPayload);

      const response = await createNewsletter(finalPayload);

      console.log("Newsletter created successfully:", response);

      // Redirect to newsletter list with success parameter
      router.push("/admin/news-letter?success=created");
    } catch (error: any) {
      console.error("Failed to create newsletter:", error);
      dispatch(setError(error.message || "Failed to create newsletter"));
      addToast({
        variant: "error",
        title: "Error",
        message: error.message || "Failed to create newsletter. Please try again.",
      });
    } finally {
      dispatch(setSubmitting(false));
    }
  };

  return (
    <>
      <style>
        {`
          .react-datepicker__day--disabled {
            color: #d1d5db !important;
            cursor: not-allowed !important;
            pointer-events: none !important;
            opacity: 0.4 !important;
          }
          .react-datepicker__day--disabled:hover {
            background-color: transparent !important;
          }
          .react-datepicker__day--outside-month {
            color: #d1d5db !important;
            opacity: 0.4 !important;
          }
        `}
      </style>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="text-center mb-8">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-indigo-100 mb-4">
              <svg className="h-8 w-8 text-indigo-600" fill="#006d36" stroke="#fff" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Schedule</h2>
            <p className="text-gray-600">Choose when to send your newsletter.</p>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-4">When will you send the email?</label>
              <div className="space-y-3">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="sendOption"
                    value="now"
                    checked={sendOption === "now"}
                    onChange={() => setSendOption("now")}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <span className="ml-3 text-sm text-gray-700">Send now</span>
                </label>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="sendOption"
                    value="later"
                    checked={sendOption === "later"}
                    onChange={() => setSendOption("later")}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <span className="ml-3 text-sm text-gray-700">Schedule for later</span>
                </label>
              </div>
            </div>
            {sendOption === "later" && (
              <div className="space-y-4 pl-7 animate-fadeIn">
                <div>
                  <label htmlFor="scheduledDate" className="block text-sm font-medium text-gray-700 mb-2">
                    Date
                  </label>
                  <div className="relative w-full">
                    <DatePicker
                      selected={scheduledDate}
                      onChange={(date: Date | null) => date && setScheduledDate(date)}
                      minDate={getTodayDate()}
                      dateFormat="MM/dd/yyyy"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
                      calendarClassName="shadow-lg"
                      showPopperArrow={false}
                      wrapperClassName="w-full"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="scheduledTime" className="block text-sm font-medium text-gray-700 mb-2">
                    Time (EDT)
                  </label>
                  <div className="relative w-full">
                    <input
                      type="time"
                      id="scheduledTime"
                      value={scheduledTime}
                      onChange={(e) => setScheduledTime(e.target.value)}
                      required
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
                      style={{ colorScheme: "light" }}
                    />
                  </div>
                </div>
              </div>
            )}{" "}
            <div className="pt-4 border-t border-gray-200">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={saveAsTemplate}
                  onChange={(e) => setSaveAsTemplate(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-3 text-sm text-gray-700">Save as template</span>
                <span className="ml-2 text-gray-400">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                </span>
              </label>
            </div>
            <div className="flex justify-end pt-4">
              <button
                type="button"
                onClick={submitNewsletter}
                disabled={isSubmitting}
                className="px-6 py-2.5 bg-primary text-white font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Submitting..." : sendOption === "now" ? "Send Now" : "Schedule Newsletter"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ScheduleStep;
