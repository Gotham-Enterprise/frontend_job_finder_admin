"use client";
import React, { useState, useEffect } from "react";
import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";
import { useQuery } from "@tanstack/react-query";
import { dashboardApi } from "../../services/api/dashboard";
import { useOccupations } from "../../services/hooks/useOccupations";
import { TrendType, DailyTrendData, MonthlyTrendData, QuarterlyTrendData } from "../../services/types/dashboard";
import DatePicker from "../form/date-picker";
import Select from "../form/Select";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

export default function CategoryDistribution() {
  // State management
  const [selectedOccupationId, setSelectedOccupationId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<TrendType>("daily");
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);

  // Fetch occupations
  const { data: occupationsData, isLoading: occupationsLoading } = useOccupations();

  // Fetch application category data
  const { data: categoryData, isLoading: categoryLoading } = useQuery({
    queryKey: ["applicationCategory", selectedOccupationId, activeTab, selectedYear, selectedMonth],
    queryFn: () => {
      if (!selectedOccupationId) return null;

      return dashboardApi.getApplicationCategory({
        type: activeTab,
        year: selectedYear,
        month: activeTab === "daily" ? selectedMonth : undefined,
        occupationId: selectedOccupationId,
      });
    },
    enabled: !!selectedOccupationId,
  });

  // Set default occupation when occupations are loaded
  useEffect(() => {
    if (occupationsData?.data && occupationsData.data.length > 0 && !selectedOccupationId) {
      setSelectedOccupationId(occupationsData.data[0].id);
    }
  }, [occupationsData, selectedOccupationId]);

  // Process data for chart
  const getChartData = () => {
    if (!categoryData?.data) return { categories: [], data: [] };

    const data = categoryData.data as DailyTrendData[] | MonthlyTrendData[] | QuarterlyTrendData[];

    if (activeTab === "daily") {
      const dailyData = data as DailyTrendData[];
      return {
        categories: dailyData.map((item) => `Day ${item.day}`),
        data: dailyData.map((item) => item.count),
      };
    } else if (activeTab === "monthly") {
      const monthlyData = data as MonthlyTrendData[];
      return {
        categories: monthlyData.map((item) => item.month),
        data: monthlyData.map((item) => item.count),
      };
    } else {
      const quarterlyData = data as QuarterlyTrendData[];
      return {
        categories: quarterlyData.map((item) => item.quarter),
        data: quarterlyData.map((item) => item.count),
      };
    }
  };

  const chartData = getChartData();

  const options: ApexOptions = {
    chart: {
      fontFamily: "Outfit, sans-serif",
      height: 310,
      type: "bar",
      toolbar: {
        show: false,
      },
    },
    colors: ["#465FFF"],
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "55%",
        borderRadius: 4,
      },
    },
    dataLabels: {
      enabled: false,
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
        text: "Applications Count",
        style: {
          fontSize: "14px",
          color: "#374151",
        },
      },
    },
    tooltip: {
      enabled: true,
      y: {
        formatter: (value) => `${value} applications`,
      },
    },
  };

  const series = [
    {
      name: "Applications",
      data: chartData.data,
    },
  ];
  // Handle tab changes
  const handleTabChange = (tab: TrendType) => {
    setActiveTab(tab);
  };

  if (occupationsLoading) {
    return (
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
        <div className="flex items-center justify-center h-[400px]">
          <div className="text-gray-500">Loading occupations...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Applications by Job Category</h3>
      </div>

      {/* Occupation Filter */}
      <div className="mb-4">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Occupation:</label>
          <div className="min-w-[300px]">
            <Select
              options={
                occupationsData?.data?.map((occupation) => ({
                  value: occupation.id.toString(),
                  label: occupation.name,
                })) || []
              }
              placeholder="Select Occupation"
              value={selectedOccupationId?.toString() || ""}
              onChange={(value) => setSelectedOccupationId(value ? Number(value) : null)}
              disabled={occupationsLoading}
              searchable={true}
              searchPlaceholder="Search occupations..."
            />
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
          {(["monthly", "quarterly", "daily"] as TrendType[]).map((tab) => (
            <button
              key={tab}
              onClick={() => handleTabChange(tab)}
              disabled={!selectedOccupationId}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                activeTab === tab
                  ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              } ${!selectedOccupationId ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Date Picker for Daily View */}
        {activeTab === "daily" && selectedOccupationId && (
          <div className="w-48">
            <DatePicker
              id="daily-date-picker"
              defaultDate={new Date(selectedYear, selectedMonth - 1, 1)}
              onChange={(selectedDates: Date[]) => {
                if (selectedDates && selectedDates.length > 0) {
                  const date = selectedDates[0];
                  const year = date.getFullYear();
                  const month = date.getMonth() + 1;

                  setSelectedYear(year);
                  setSelectedMonth(month);
                }
              }}
              placeholder="Select Month/Year"
            />
          </div>
        )}

        {/* Date Picker for Monthly and Quarterly Views (Year only) */}
        {(activeTab === "monthly" || activeTab === "quarterly") && selectedOccupationId && (
          <div className="w-32">
            <DatePicker
              id="year-date-picker"
              defaultDate={new Date(selectedYear, 0, 1)}
              onChange={(selectedDates: Date[]) => {
                if (selectedDates && selectedDates.length > 0) {
                  const date = selectedDates[0];
                  const year = date.getFullYear();
                  if (year !== selectedYear) {
                    setSelectedYear(year);
                  }
                }
              }}
              placeholder="Select Year"
            />
          </div>
        )}
      </div>

      {/* Chart Content */}
      {!selectedOccupationId ? (
        <div className="flex items-center justify-center h-96">
          <div className="text-gray-500 dark:text-gray-400">
            <p>Please select an occupation to view data</p>
          </div>
        </div>
      ) : categoryLoading ? (
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
        </div>
      ) : categoryData && chartData.categories.length > 0 ? (
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
