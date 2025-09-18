import { useEffect } from "react";
import flatpickr from "flatpickr";
import "flatpickr/dist/flatpickr.css";
import Label from "./Label";
import { CalenderIcon } from "../../icons";
import Hook = flatpickr.Options.Hook;
import DateOption = flatpickr.Options.DateOption;

type PropsType = {
  id: string;
  mode?: "single" | "multiple" | "range" | "time";
  onChange?: Hook | Hook[];
  defaultDate?: DateOption;
  label?: string;
  placeholder?: string;
  monthSelectorType?: "dropdown" | "static";
  showMonths?: number;
  dateFormat?: string;
};

export default function DatePicker({ 
  id, 
  mode, 
  onChange, 
  label, 
  defaultDate, 
  placeholder, 
  monthSelectorType = "dropdown",
  showMonths = 1,
  dateFormat = "Y-m-d"
}: PropsType) {
  useEffect(() => {
    let scrollHandler: (() => void) | null = null;
    let resizeHandler: (() => void) | null = null;

    const updateCalendarPosition = () => {
      const calendar = document.querySelector(".flatpickr-calendar") as HTMLElement;
      const input = document.getElementById(id);

      if (calendar && input && calendar.classList.contains("open")) {
        const rect = input.getBoundingClientRect();
        const calendarWidth = 280;
        const calendarHeight = 320;
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        let left = rect.left;
        let top = rect.bottom + 5;

        // Adjust horizontal position if calendar would go off-screen
        if (rect.right + calendarWidth > viewportWidth) {
          left = Math.max(10, rect.right - calendarWidth);
        }

        // Adjust vertical position if calendar would go off-screen
        if (rect.bottom + calendarHeight > viewportHeight) {
          top = Math.max(10, rect.top - calendarHeight - 5);
        }

        calendar.style.left = `${left}px`;
        calendar.style.top = `${top}px`;
      }
    };

    const flatPickr = flatpickr(`#${id}`, {
      mode: mode || "single",
      static: false,
      position: "auto right",
      monthSelectorType,
      dateFormat,
      defaultDate,
      onChange,
      showMonths,
      enableTime: false,
      onOpen: function () {
        const calendar = document.querySelector(".flatpickr-calendar") as HTMLElement;
        if (calendar) {
          calendar.style.zIndex = "999999";
          calendar.style.position = "absolute";

          // Initial positioning
          updateCalendarPosition();

          // Add scroll and resize event listeners
          scrollHandler = () => updateCalendarPosition();
          resizeHandler = () => updateCalendarPosition();

          window.addEventListener("scroll", scrollHandler, true);
          window.addEventListener("resize", resizeHandler);
        }
      },
      onClose: function () {
        // Remove event listeners when calendar closes
        if (scrollHandler) {
          window.removeEventListener("scroll", scrollHandler, true);
          scrollHandler = null;
        }
        if (resizeHandler) {
          window.removeEventListener("resize", resizeHandler);
          resizeHandler = null;
        }
      },
    });

    if (defaultDate && flatPickr && !Array.isArray(flatPickr)) {
      flatPickr.setDate(defaultDate, false);
    }

    return () => {
      // Clean up event listeners
      if (scrollHandler) {
        window.removeEventListener("scroll", scrollHandler, true);
      }
      if (resizeHandler) {
        window.removeEventListener("resize", resizeHandler);
      }

      if (!Array.isArray(flatPickr)) {
        flatPickr.destroy();
      }
    };
  }, [mode, onChange, id, defaultDate, monthSelectorType, showMonths, dateFormat]);

  return (
    <div>
      {label && <Label htmlFor={id}>{label}</Label>}

      <div className="relative">
        <input
          id={id}
          placeholder={placeholder}
          className="h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3  dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30  bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-brand-500/20 dark:border-gray-700  dark:focus:border-brand-800"
        />

        <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
          <CalenderIcon className="size-6" />
        </span>
      </div>

      <style jsx global>{`
        .flatpickr-calendar {
          background-color: #1f2937 !important;
          border: 1px solid #4b5563 !important;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5) !important;
          border-radius: 8px !important;
        }
        .flatpickr-calendar .flatpickr-months {
          background-color: #1f2937 !important;
        }
        .flatpickr-calendar .flatpickr-month {
          background-color: #1f2937 !important;
          color: #f3f4f6 !important;
        }
        .flatpickr-calendar .flatpickr-weekdays {
          background-color: #374151 !important;
        }
        .flatpickr-calendar .flatpickr-weekday {
          color: #d1d5db !important;
        }
        .flatpickr-calendar .flatpickr-days {
          background-color: #1f2937 !important;
        }
        .flatpickr-calendar .flatpickr-day {
          color: #f3f4f6 !important;
          border: none !important;
        }
        .flatpickr-calendar .flatpickr-day:hover {
          background-color: #374151 !important;
          border-color: #374151 !important;
        }
        .flatpickr-calendar .flatpickr-day.selected {
          background-color: #3b82f6 !important;
          border-color: #3b82f6 !important;
        }
        .flatpickr-calendar .flatpickr-day.today {
          border-color: #3b82f6 !important;
          color: #3b82f6 !important;
        }
        .flatpickr-prev-month,
        .flatpickr-next-month {
          color: #f3f4f6 !important;
          fill: #f3f4f6 !important;
        }
        .flatpickr-prev-month:hover,
        .flatpickr-next-month:hover {
          color: #3b82f6 !important;
          fill: #3b82f6 !important;
        }
        .flatpickr-current-month .flatpickr-monthDropdown-months {
          background-color: #1f2937 !important;
          color: #f3f4f6 !important;
          border: 1px solid #4b5563 !important;
          border-radius: 4px !important;
        }
        .flatpickr-current-month .flatpickr-monthDropdown-months:hover {
          background-color: #374151 !important;
          border-color: #3b82f6 !important;
        }
        .flatpickr-current-month .flatpickr-monthDropdown-months option {
          background-color: #1f2937 !important;
          color: #f3f4f6 !important;
        }
        .flatpickr-current-month .flatpickr-monthDropdown-months option:hover {
          background-color: #3b82f6 !important;
        }
        .flatpickr-current-month input.cur-year {
          background-color: #1f2937 !important;
          color: #f3f4f6 !important;
          border: 1px solid #4b5563 !important;
        }
        .flatpickr-current-month .numInputWrapper span {
          border-color: #4b5563 !important;
          background: #374151 !important;
          color: #f3f4f6 !important;
        }
        .flatpickr-current-month .numInputWrapper span:hover {
          background: #4b5563 !important;
        }
        .flatpickr-month {
          height: auto !important;
          display: flex !important;
          align-items: center !important;
          justify-content: space-between !important;
          padding: 8px 12px !important;
        }
        .flatpickr-current-month {
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          flex: 1 !important;
        }
        .flatpickr-current-month .flatpickr-monthDropdown-months {
          font-size: 14px !important;
          font-weight: 500 !important;
          padding: 4px 8px !important;
          min-width: 100px !important;
        }
      `}</style>
    </div>
  );
}
