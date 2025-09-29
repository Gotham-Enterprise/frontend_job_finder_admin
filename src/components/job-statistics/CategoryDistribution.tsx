"use client";
import React, { useState, useEffect } from "react";
import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";
import { useQuery } from "@tanstack/react-query";
import { dashboardApi } from "../../services/api/dashboard";
import { jobCreationApi } from "../../services/api/jobCreation";
import { TrendType, DailyTrendData, MonthlyTrendData, QuarterlyTrendData } from "../../services/types/dashboard";
import Select from "../form/Select";
import { CalenderIcon } from "@/icons";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

export default function CategoryDistribution() {
  // State management
  const [selectedOccupationId, setSelectedOccupationId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<TrendType>("daily");
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);

  // Fetch occupations (using API endpoint that returns occupations with specialties)
  const { data: occupationsData, isLoading: occupationsLoading } = useQuery({
    queryKey: ["occupationsWithSpecialties"],
    queryFn: () => jobCreationApi.getOccupationsWithSpecialties(),
    // keep enabled true so it fetches on mount
    enabled: true,
  });

  // Fetch application category data
  const {
    data: categoryData,
    isLoading: categoryLoading,
    refetch,
  } = useQuery({
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

  // Refetch data when filters change
  useEffect(() => {
    if (selectedOccupationId) {
      refetch();
    }
  }, [selectedOccupationId, activeTab, selectedYear, selectedMonth, refetch]);

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
      type: "line",
      toolbar: {
        show: false,
      },
    },
    colors: ["#006d36"],
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
        gradientToColors: ["#9CB9FF"],
        inverseColors: false,
        opacityFrom: 0.4,
        opacityTo: 0.1,
        stops: [0, 100],
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
        text: "",
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

        {/* Filter Controls - Show based on active tab */}
        {selectedOccupationId && activeTab !== "daily" && (
          <div className="flex items-center space-x-3">
            {/* Year Select - Show for both monthly and quarterly */}
            <div className="w-32 relative">
              <Select
                value={selectedYear.toString()}
                onChange={(value) => {
                  const year = parseInt(value);
                  setSelectedYear(year);
                }}
                options={Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i).map((year) => ({
                  value: year.toString(),
                  label: year.toString(),
                }))}
                placeholder="Select Year"
                className="pr-10"
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none z-10">
                <CalenderIcon className="text-gray-400" />
              </div>
            </div>
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
            <ReactApexChart options={options} series={series} type="area" height={400} />
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
