"use client";
import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";
import { MoreDotIcon } from "@/icons";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { useState, useMemo } from "react";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { useApplicationTrends } from "@/services/hooks/useApplicationTrends";
import { TrendType, DailyTrendData, MonthlyTrendData, QuarterlyTrendData } from "@/services/types/dashboard";
import DatePicker from "../form/date-picker";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

export default function JobApplicationTrends() {
  const { data, loading, error, fetchTrends } = useApplicationTrends();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TrendType>("monthly");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);

  // Format data for chart based on trend type
  const chartData = useMemo(() => {
    if (!data || !Array.isArray(data) || data.length === 0) {
      return { categories: [], seriesData: [] };
    }

    switch (activeTab) {
      case "daily":
        const dailyData = data as DailyTrendData[];
        return {
          categories: dailyData
            .filter((item) => item && typeof item.day !== "undefined")
            .map((item) => item.day.toString()),
          seriesData: dailyData.filter((item) => item && typeof item.count !== "undefined").map((item) => item.count),
        };

      case "monthly":
        const monthlyData = data as MonthlyTrendData[];
        const monthAbbr = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        return {
          categories: monthlyData
            .filter((item) => item && item.month)
            .map((item) => {
              const monthIndex = monthlyData.indexOf(item);
              return monthAbbr[monthIndex] || item.month.substring(0, 3);
            }),
          seriesData: monthlyData.filter((item) => item && typeof item.count !== "undefined").map((item) => item.count),
        };

      case "quarterly":
        const quarterlyData = data as QuarterlyTrendData[];
        return {
          categories: quarterlyData.filter((item) => item && item.quarter).map((item) => item.quarter),
          seriesData: quarterlyData
            .filter((item) => item && typeof item.count !== "undefined")
            .map((item) => item.count),
        };

      default:
        return { categories: [], seriesData: [] };
    }
  }, [data, activeTab]);

  const options: ApexOptions = {
    colors: ["#006d36"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "bar",
      height: 180,
      toolbar: {
        show: false,
      },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "39%",
        borderRadius: 5,
        borderRadiusApplication: "end",
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      show: true,
      width: 4,
      colors: ["transparent"],
    },
    xaxis: {
      categories: chartData.categories,
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
      opacity: 1,
    },
    tooltip: {
      x: {
        show: false,
      },
      y: {
        formatter: (val: number) => `${val}`,
      },
    },
  };

  const series = [
    {
      name: "Applications",
      data: chartData.seriesData,
    },
  ];

  const handleTabChange = async (tab: TrendType) => {
    setActiveTab(tab);

    const params = {
      type: tab,
      year: selectedYear,
      ...(tab === "daily" && { month: selectedMonth }),
    };

    await fetchTrends(params);
  };

  const handleYearChange = async (year: number) => {
    setSelectedYear(year);

    const params = {
      type: activeTab,
      year,
      ...(activeTab === "daily" && { month: selectedMonth }),
    };

    await fetchTrends(params);
  };

  const handleMonthChange = async (month: number) => {
    setSelectedMonth(month);

    if (activeTab === "daily") {
      await fetchTrends({
        type: "daily",
        year: selectedYear,
        month,
      });
    }
  };

  function toggleDropdown() {
    setIsOpen(!isOpen);
  }

  function closeDropdown() {
    setIsOpen(false);
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-5 dark:border-red-800 dark:bg-red-900/10 md:p-6">
        <div className="text-red-600 dark:text-red-400">
          <h4 className="font-semibold">Error loading application trends</h4>
          <p className="text-sm mt-1">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Job Application Trends</h3>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
          {(["monthly", "quarterly", "daily"] as TrendType[]).map((tab) => (
            <button
              key={tab}
              onClick={() => handleTabChange(tab)}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                activeTab === tab
                  ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Date Picker - Dynamic based on active filter */}
        <div className={activeTab === "daily" ? "w-48" : "w-32"}>
          <DatePicker
            id="trends-date-picker"
            defaultDate={activeTab === "daily" ? new Date(selectedYear, selectedMonth - 1, 1) : new Date(selectedYear, 0, 1)}
            monthSelectorType="dropdown"
            showMonths={1}
            dateFormat={activeTab === "daily" ? "Y-m-d" : "Y"}
            onChange={(selectedDates: Date[]) => {
              if (selectedDates && selectedDates.length > 0) {
                const date = selectedDates[0];
                const year = date.getFullYear();
                const month = date.getMonth() + 1;

                // Update state based on filter type
                setSelectedYear(year);
                if (activeTab === "daily") {
                  setSelectedMonth(month);
                }

                // Make API call with current active filter
                const params = {
                  type: activeTab,
                  year,
                  ...(activeTab === "daily" && { month }),
                };
                
                fetchTrends(params);
              }
            }}
            placeholder={activeTab === "daily" ? "Select Month/Year" : "Select Year"}
          />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
        </div>
      ) : data && chartData.categories.length > 0 ? (
        <div className="max-w-full overflow-x-auto custom-scrollbar">
          <div className="-ml-5 min-w-[650px] xl:min-w-full pl-2">
            <ReactApexChart options={options} series={series} type="bar" height={400} />
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center h-96">
          <div className="text-gray-500 dark:text-gray-400">
            <p>No data available for the selected period</p>
          </div>
        </div>
      )}
    </div>
  );
}
