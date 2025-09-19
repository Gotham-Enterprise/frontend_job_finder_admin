"use client";
import React, { useState, useEffect, useMemo } from "react";
import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";
import { useBlogAnalytics } from "../../services/hooks/useBlogAnalytics";
import { TrendType, DailyTrendData, MonthlyTrendData, QuarterlyTrendData } from "../../services/types/dashboard";
import DatePicker from "../form/date-picker";
import { BlogIcon, EyeIcon, PieChartIcon } from "@/icons";
import Badge from "../ui/badge/Badge";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

export default function BlogAnalytics() {
  // State management
  const [activeTab, setActiveTab] = useState<TrendType>("monthly");
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);

  // Fetch blog analytics data
  const { analyticsData, viewCountData, loading, error, fetchAnalytics, fetchViewCount } = useBlogAnalytics();

  // Handle filter changes
  useEffect(() => {
    fetchAnalytics({
      type: activeTab,
      year: selectedYear,
      ...(activeTab === "daily" && { month: selectedMonth }),
    });
  }, [activeTab, selectedYear, selectedMonth, fetchAnalytics]);

  // Update view count when month/year changes
  useEffect(() => {
    fetchViewCount({
      month: selectedMonth,
      year: selectedYear,
    });
  }, [selectedMonth, selectedYear, fetchViewCount]);

  // Process data for chart
  const chartData = useMemo(() => {
    if (!analyticsData || !Array.isArray(analyticsData) || analyticsData.length === 0) {
      return { categories: [], seriesData: [] };
    }

    switch (activeTab) {
      case "daily":
        const dailyData = analyticsData as DailyTrendData[];
        return {
          categories: dailyData
            .filter((item) => item && typeof item.day !== "undefined")
            .map((item) => `Day ${item.day}`),
          seriesData: dailyData.filter((item) => item && typeof item.count !== "undefined").map((item) => item.count),
        };

      case "monthly":
        const monthlyData = analyticsData as MonthlyTrendData[];
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
        const quarterlyData = analyticsData as QuarterlyTrendData[];
        return {
          categories: quarterlyData.filter((item) => item && item.quarter).map((item) => item.quarter),
          seriesData: quarterlyData
            .filter((item) => item && typeof item.count !== "undefined")
            .map((item) => item.count),
        };

      default:
        return { categories: [], seriesData: [] };
    }
  }, [analyticsData, activeTab]);

  const options: ApexOptions = {
    colors: ["#0ea5e9"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "area",
      height: 400,
      toolbar: {
        show: false,
      },
    },
    plotOptions: {
      area: {
        fillTo: "origin",
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: "smooth",
      width: 3,
    },
    markers: {
      size: 6,
      strokeColors: "#fff",
      strokeWidth: 2,
      hover: {
        size: 8,
      },
    },
    fill: {
      type: "gradient",
      gradient: {
        shade: "light",
        type: "vertical",
        shadeIntensity: 0.5,
        gradientToColors: ["#93c5fd"],
        inverseColors: false,
        opacityFrom: 0.4,
        opacityTo: 0.1,
        stops: [0, 100],
      },
    },
    grid: {
      xaxis: {
        lines: {
          show: false,
        },
      },
      yaxis: {
        lines: {
          show: true,
        },
      },
      strokeDashArray: 3,
      borderColor: "#e0e6ed",
    },
    xaxis: {
      categories: chartData.categories,
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
      labels: {
        style: {
          fontSize: "12px",
          colors: ["#6B7280"],
        },
      },
    },
    yaxis: {
      labels: {
        style: {
          fontSize: "12px",
          colors: ["#6B7280"],
        },
      },
      title: {
        text: "Blog Views",
        style: {
          fontSize: "14px",
          color: "#374151",
        },
      },
    },
    tooltip: {
      enabled: true,
      y: {
        formatter: (value) => `${value} views`,
      },
    },
  };

  const series = [
    {
      name: "Blog Views",
      data: chartData.seriesData,
    },
  ];

  const handleTabChange = (tab: TrendType) => {
    setActiveTab(tab);

    // Immediately fetch analytics for the new tab
    fetchAnalytics({
      type: tab,
      year: selectedYear,
      ...(tab === "daily" && { month: selectedMonth }),
    });
  };

  if (error) {
    return (
      <div className="space-y-6">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5 dark:border-red-800 dark:bg-red-900/10 md:p-6">
          <div className="text-red-600 dark:text-red-400">
            <h4 className="font-semibold">Error loading blog analytics</h4>
            <p className="text-sm mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Blog Metrics Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 md:gap-6">
        {/* Total Blog Views */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
          <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-xl dark:bg-blue-900/20">
            <BlogIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex items-end justify-between mt-5">
            <div>
              <span className="text-sm text-gray-500 dark:text-gray-400">Total Blog Views</span>
              <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
                {loading ? (
                  <div className="h-6 bg-gray-200 rounded animate-pulse dark:bg-gray-700 w-16"></div>
                ) : (
                  viewCountData?.blogViewCount || 0
                )}
              </h4>
            </div>
          </div>
        </div>

        {/* Today's Blog Views */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
          <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-xl dark:bg-green-900/20">
            <EyeIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
          </div>
          <div className="flex items-end justify-between mt-5">
            <div>
              <span className="text-sm text-gray-500 dark:text-gray-400">Today's Views</span>
              <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
                {loading ? (
                  <div className="h-6 bg-gray-200 rounded animate-pulse dark:bg-gray-700 w-16"></div>
                ) : (
                  viewCountData?.blogViewCountToday || 0
                )}
              </h4>
            </div>
          </div>
        </div>

        {/* This Month's Views */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
          <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-xl dark:bg-purple-900/20">
            <PieChartIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="flex items-end justify-between mt-5">
            <div>
              <span className="text-sm text-gray-500 dark:text-gray-400">This Month</span>
              <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
                {loading ? (
                  <div className="h-6 bg-gray-200 rounded animate-pulse dark:bg-gray-700 w-16"></div>
                ) : (
                  viewCountData?.blogViewMonth || 0
                )}
              </h4>
            </div>
          </div>
        </div>
      </div>

      {/* Blog Analytics Chart */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Blog View Analytics</h3>
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
              key={`${activeTab}-${selectedYear}-${selectedMonth}`}
              id="blog-analytics-date-picker"
              defaultDate={
                activeTab === "daily" ? new Date(selectedYear, selectedMonth - 1, 1) : new Date(selectedYear, 0, 1)
              }
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

                  // Immediately trigger API calls with new values
                  fetchAnalytics({
                    type: activeTab,
                    year: year,
                    ...(activeTab === "daily" && { month: month }),
                  });

                  fetchViewCount({
                    month: activeTab === "daily" ? month : selectedMonth,
                    year: year,
                  });
                }
              }}
              placeholder={activeTab === "daily" ? "Select Month/Year" : "Select Year"}
            />
          </div>
        </div>

        {/* Chart Content */}
        {loading ? (
          <div className="flex items-center justify-center h-96">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : analyticsData && chartData.categories.length > 0 ? (
          <div className="max-w-full overflow-x-auto custom-scrollbar">
            <div className="-ml-5 min-w-[650px] xl:min-w-full pl-2">
              <ReactApexChart options={options} series={series} type="area" height={400} />
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-96">
            <div className="text-gray-500 dark:text-gray-400">
              <p>No blog analytics data available for the selected period</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
