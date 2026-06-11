import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";
import { useEffect, useState, useRef, useMemo, useCallback } from "react";
import { adminAnalyticsService } from "@/services/adminAnalytics";
import type { Period, GroupBy } from "@/types/analytics";
import { buildCustomDateRange, formatDateForDisplay } from "@/utils/chartDateUtils";
import flatpickr from "flatpickr";
import "flatpickr/dist/flatpickr.css";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

interface JobseekerTrendsProps {
  refreshKey?: number;
}

// Moved outside component — pure function with no closure deps.
// Driven by the actual dataLength returned from the API so it adapts correctly
// for any groupBy (monthly → few labels, daily → many labels).
function getTickAmount(dataLength: number): number | undefined {
  if (dataLength <= 12)  return undefined; // show all — ApexCharts auto-spaces
  if (dataLength <= 31)  return 7;
  if (dataLength <= 52)  return 12;
  if (dataLength <= 180) return 12;
  return 18;
}

// Static — never changes. Defined outside so it isn't reallocated every render.
const PERIOD_LABELS: Record<Exclude<Period, "custom">, string> = {
  "24h": "24H",
  "7d":  "7D",
  "28d": "1M",
  "3m":  "3M",
  "6m":  "6M",
  "9m":  "9M",
  "1y":  "1Y",
};

const GROUP_BY_LABELS: Record<GroupBy, string> = {
  daily:   "Daily",
  weekly:  "Weekly",
  monthly: "Monthly",
};

// Periods that show the groupBy selector. 24h / 7d / 28d are always fixed-grain.
const GROUPBY_ELIGIBLE_PERIODS = new Set<Period>(["3m", "6m", "9m", "1y", "custom"]);

export default function JobseekerTrends({ refreshKey }: JobseekerTrendsProps) {
  const [period, setPeriod] = useState<Period>("3m");
  // Default monthly for all groupBy-eligible periods (3m → 1y and custom).
  const [groupBy, setGroupBy] = useState<GroupBy>("monthly");
  const [categories, setCategories] = useState<string[]>([]);
  const [data, setData] = useState<number[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [showCustomDatePicker, setShowCustomDatePicker] = useState(false);
  const [customDateRange, setCustomDateRange] = useState<{
    startDate: string | null;
    endDate: string | null;
  }>({ startDate: null, endDate: null });
  const datePickerRef = useRef<HTMLInputElement>(null);
  const flatpickrInstance = useRef<flatpickr.Instance | null>(null);

  // Whether to show the groupBy selector for the current period.
  const showGroupBySelector = GROUPBY_ELIGIBLE_PERIODS.has(period);

  // Rotate x-axis labels when there are enough data points to crowd them.
  const shouldRotateLabels = categories.length > 13;

  const options: ApexOptions = useMemo(() => ({
    colors: ["#10B981"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "area",
      height: 420,
      toolbar: {
        show: false,
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: "smooth",
      width: 2,
    },
    xaxis: {
      categories: categories,
      tickAmount: getTickAmount(categories.length),
      labels: {
        rotate: -45,
        rotateAlways: shouldRotateLabels,
        hideOverlappingLabels: true,
        trim: false,
        style: {
          fontSize: categories.length > 52 ? "10px" : "11px",
        },
      },
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
    },
    legend: {
      show: true,
      position: "top",
      horizontalAlign: "left",
      fontFamily: "Outfit",
    },
    yaxis: {
      title: {
        text: undefined,
      },
    },
    grid: {
      yaxis: {
        lines: {
          show: true,
        },
      },
    },
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.4,
        opacityTo: 0.1,
        stops: [0, 90, 100],
      },
    },
    tooltip: {
      x: {
        show: false,
      },
      y: {
        formatter: (val: number) => `${val}`,
      },
    },
  }), [categories, shouldRotateLabels]);

  // Memoized so react-apexcharts receives a stable reference between renders.
  // Without this, a new array is created on every render (e.g. when isLoading
  // or showCustomDatePicker flip), which ApexCharts treats as new data and
  // re-draws the chart — the source of the hover re-render loop.
  const series = useMemo(
    () => [{ name: "New Jobseekers", data }],
    [data]
  );

  useEffect(() => {
    if (datePickerRef.current && !flatpickrInstance.current) {
      flatpickrInstance.current = flatpickr(datePickerRef.current, {
        mode: "range",
        dateFormat: "m-d-Y", // MM-DD-YYYY format
        maxDate: "today",
        onChange: (selectedDates) => {
          if (selectedDates.length === 2) {
            // Use formatLocalDate (not toISOString) to avoid UTC-shift for
            // timezones ahead of UTC — e.g. UTC+8 would roll Apr 3 midnight
            // back to "2026-04-02" via toISOString, dropping the last day.
            const range = buildCustomDateRange(selectedDates[0], selectedDates[1]);
            setCustomDateRange(range);
            setPeriod("custom");
          }
        },
        onClose: () => {
          setShowCustomDatePicker(false);
        },
        clickOpens: false, // Prevent auto-open on click
      });
    }

    return () => {
      if (flatpickrInstance.current) {
        flatpickrInstance.current.destroy();
        flatpickrInstance.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const fetchTrends = async () => {
      try {
        setIsLoading(true);
        // Pass groupBy only for eligible periods — backend ignores it for 24h/7d/28d
        // but sending it anyway is harmless; we skip it for clarity.
        const effectiveGroupBy = GROUPBY_ELIGIBLE_PERIODS.has(period) ? groupBy : undefined;
        const response = await adminAnalyticsService.getJobseekerTrends(
          period,
          period === "custom" ? customDateRange : undefined,
          effectiveGroupBy
        );
        if (response.success && response.data) {
          setCategories(response.data.categories);
          setData(response.data.data);
          setTotal(response.data.total || 0);
        }
      } catch (error) {
        console.error("Error fetching jobseeker trends:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (period !== "custom" || (customDateRange.startDate && customDateRange.endDate)) {
      fetchTrends();
    }
  }, [period, groupBy, refreshKey, customDateRange]);

  const handleCustomDateClick = useCallback(() => {
    setShowCustomDatePicker(true);
    flatpickrInstance.current?.open();
  }, []);

  const handlePeriodClick = useCallback((p: Exclude<Period, "custom">) => {
    setPeriod(p);
    setCustomDateRange({ startDate: null, endDate: null });
  }, []);

  const handleGroupByClick = useCallback((g: GroupBy) => {
    setGroupBy(g);
  }, []);

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          New Jobseeker Registrations
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Total New Jobseekers: <span className="font-semibold text-gray-800 dark:text-white/90">{total.toLocaleString()}</span>
        </p>
      </div>

      {/* Controls row — period selector + groupBy selector */}
      <div className="flex flex-wrap gap-3 mb-4 items-center justify-between">
        {/* Period selector */}
        <div className="flex gap-2 flex-wrap items-center">
          <div className="inline-flex gap-2 p-1.5 bg-gray-100 dark:bg-gray-800 rounded-xl relative">
            {(Object.keys(PERIOD_LABELS) as Array<Exclude<Period, "custom">>).map((p) => (
              <button
                key={p}
                onClick={() => handlePeriodClick(p)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  period === p
                    ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                {PERIOD_LABELS[p]}
              </button>
            ))}
            <div className="relative">
              <button
                onClick={handleCustomDateClick}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  period === "custom"
                    ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                }`}
                title="Custom Date Range"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </button>
              {/* Hidden date picker input positioned next to button */}
              <input
                ref={datePickerRef}
                type="text"
                className="absolute top-0 left-0 opacity-0 pointer-events-none w-full h-full"
                placeholder="Select date range"
                readOnly
              />
            </div>
          </div>
          {period === "custom" && customDateRange.startDate && customDateRange.endDate && (
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {formatDateForDisplay(customDateRange.startDate)} to {formatDateForDisplay(customDateRange.endDate)}
            </span>
          )}
        </div>

        {/* GroupBy selector — only shown for 3m, 6m, 9m, 1y, and custom ranges */}
        {showGroupBySelector && (
          <div className="inline-flex gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl">
            {(Object.keys(GROUP_BY_LABELS) as GroupBy[]).map((g) => (
              <button
                key={g}
                onClick={() => handleGroupByClick(g)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  groupBy === g
                    ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                {GROUP_BY_LABELS[g]}
              </button>
            ))}
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-[719px]">
          <div className="animate-pulse text-gray-500">Loading...</div>
        </div>
      ) : (
        // scrollbar-gutter:stable permanently reserves the scrollbar lane.
        // Without it, the scrollbar appearing/disappearing on hover steals
        // ~6 px of height, firing ApexCharts' ResizeObserver and triggering
        // a chart redraw on every hover — the root cause of the re-render loop.
        <div className="max-w-full overflow-x-auto custom-scrollbar [scrollbar-gutter:stable]">
          <div className="-ml-5 min-w-[650px] xl:min-w-full pl-2">
            <ReactApexChart
              options={options}
              series={series}
              type="area"
              height={420}
            />
          </div>
        </div>
      )}
    </div>
  );
}
